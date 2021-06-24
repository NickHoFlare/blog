---
title: 'Hello World!'
excerpt: 'Say hello to the newest blog on the block'
coverImage: '/assets/blog/hello-world/cover.jpg'
date: '2021-06-23T21:41:07.322Z'
author:
  name: Nicholas Ho
  picture: '/assets/blog/authors/Girdog.png'
ogImage:
  url: '/assets/blog/hello-world/cover.jpg'
---

## Hello World! 

You are now reading the first ever post of my dev (and perhaps occasionally other things) blog 🥳

My name is Nicholas, and I'm currently a Software Engineer at the Commonwealth Bank of Australia. Learning to write software is tough, and writing it well is even tougher. My objective in starting this blog is to provide an account of my learning journeys and sentiments on tech. This will be an account to the learning i've done, and how far i've come. Perhaps someone will stumble across this at some point and even learn a thing or two from the mistakes i've made.

## Straight to business...

A blog needs content, and what better way to christen a devblog than to talk about how this blog was set up!

At work, i've primarily been working with apps built with Angular and ReactJS, with an ASP.NET back-end, of both the Framework and Core varieties. Personally, I feel much more at home working with back-end concepts, but I enjoy making the occasional foray into Front-end land. 

I've recently discovered the front-end framework [NextJS](https://nextjs.org/), which is seemingly built on top of ReactJS, yet provides its own flavour to front-end development. A quick executive summary of my understanding of the biggest differences of the two are:
* React components/views are linked together via the use of React Router, whereas Next provides easy routing capability out of the box.
* Next accomodates several flavours of server-side rendering (SSR), such as
  * Static Generation: you get an entirely static site - data is fetched at *build time*, so there's no need to do work between requests for each page.
  * Server-side rendering: As opposed to a React Single Page App (SPA)'s *client-side rendering (CSR)* where Javascript builds the HTML of a page up on the client, SSR is akin to the old-school way of fetching each entire standalone HTML page that has been fully rendered by the server
* SSR allows the website to benefit from SEO, since HTML is available for web crawlers to peruse from the get-go, so it has access to all the site metadata etc, as opposed to client-side rendered sites, where such tags are not available on load.

This article does a pretty great job at explaining the differences between CSR and SSR: https://www.toptal.com/front-end/client-side-vs-server-side-pre-rendering

## Getting started

while poking around the documentation of Next.js, I discovered that while using create-next-app to scaffold a new application, you can define a template (there are very many) for the scaffolded app, which can be found on [Github](https://github.com/vercel/next.js/tree/canary/examples). 

I saw that there was an example entry for a ["blog starter"](https://github.com/vercel/next.js/tree/canary/examples/blog-starter-typescript) and got curious.

This website that you are now reading this blogpost on was created using the aforementioned "blog starter" template. Minimal modification has been done to it, since it appears that all this scaffolded code produces a complete and functional static website, with blogposts written in Markdown. Pretty neat! Because I wanted this blog to be started with as little fuss as possible, I then decided to keep most of the innards of the scaffolded site as-is. Maybe I will make an attempt at creating my own website to host my blog at a later time. For now, this will do.

## Hosting a static site

One of the first things I tried to do was to chuck the site onto [GitHub Pages](https://pages.github.com/), where you can host static sites for free. Sounds too good to be true! Well.. yes and no.

It's easy to *get started* with Pages, simply go to your repo's settings and flip the switch on. However, things did not "just work". As it turns out, Pages looks for the static files to be hosted on one of two locations - Root `/` or a Docs folder `/Docs`. 

My first thought was to naively create a `Docs` folder in the root level of the repo, and copy the exported website from a `next export` into the folder, but this method is very manual, and definitely not sustainable! However, I managed to get the site to show up using this method, but all the styles and images were missing, and all links were broken! 

After some digging, I found that the issue was that Github Pages had set up a basePath of `blog` for my site, but the app itself was not configured to account for this basePath - everything was still being delivered from root: `/` i.e.`/` for the homepage, `/posts` for the posts, as opposed to the expected `/blog` for the homepage and `/blog/posts` for posts. I needed to figure out a way to set up a basePath with Next!

## Down the rabbit hole 

I am tearing my hair off my head at this point! I Experienced many problems with setting up a basePath. 

First, I did some fiddling around with environment variables - I want the basepath to be applied only in Production mode, and not in development mode. Setting the `NODE_ENV` variable directly on my machine caused all sorts of hell to break loose, with archaic errors, the framework seemingly being unable to proceed past rendering beyond `_app.tsx`. Evidently, something in Next was relying on the value of `NODE_ENV`. Something was telling me that I was touching stuff that really shouldn't be tampered with!

As it turns out, when running `npm run dev` i.e. `next`, it automatically set `NODE_ENV` to 'development', whereas when making a production build with `next build`, it builds it with `NODE_ENV` set to 'production' automatically. Likewise, running `next start` runs with `NODE_ENV` set as 'production'. This is really neat! I wish this was better documented though... 

Additionally, although I had read that a Next Config entry for `AssetPrefix` was required to fix the basepath for other assets including and images and other "public" files, for some reason, nothing in the `public` folder had the basePath applied to it. As a result, the app was in a state where all images were broken, and the favicon didn't show up. 

I had to resort to a workaround, which was to create a shared helper function `applyBasePathToImage` that transforms any URLs by appending the basePath to the front of it. 

We obtain the basePath by getting it as config from next.config.js. This is how you get config from a next.config.js:
[Runtime Configuration](https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration).

Essentially, it's as easy as plopping a `publicRuntimeConfig` into your `Next.config.js` and obtiaining the config value(s) like so:
`const { publicRuntimeConfig } = getConfig();`

This introduced yet another issue - for some reason upon application of that function to a url, Next started complaining that it could not find the `fs` module (Node Filesystem), when it was plainly there, and being used successfully by other bits of code in the past. 

Following [this bug report](https://github.com/vercel/next.js/issues/7755#issuecomment-812805708), I was able to resolve the `fs` issue. I can't say that I fully understand the reason why this works, but I suspect it has something to do with `fs` being invoked in client-side code, which is when it is not available. I'll have to read up on this a little more! 

## Deployment

Now that we understand how environment works in Next and are able to obtain its value at run-time, we finally have a working app from `/blog`! 🎉🎊 

The next step is to figure out how to deploy it to Github Pages properly. I decided to use GitHub Actions as my CI/CD tool. It is free of charge to use and way powerful for a small project like this one. 

You can create an Actions Workflow by creating a .yaml file in the `.github/workflows` folder of your repo, following the format defined [here](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions).

After a bit of stumbling, I managed to create a Github Actions workflow like so:

```yaml
name: Build static Next.JS site
on: [push]
jobs:
  Build-Static-Site:
    runs-on: ubuntu-latest
    steps:
      - run: echo "🎉 The job was automatically triggered by a ${{ github.event_name }} event."
      - run: echo "🐧 This job is now running on a ${{ runner.os }} server hosted by GitHub!"
      - run: echo "🔎 The name of your branch is ${{ github.ref }} and your repository is ${{ github.repository }}."
      
      - name: Check out repository code
        uses: actions/checkout@v2 # Default Github-provided action to checkout code from the repo
      
      - run: echo "💡 The ${{ github.repository }} repository has been cloned to the runner."
      - run: echo "🖥️ The workflow is now ready to test your code on the runner."
      
      # by default, we are plopped on the root directory of the repo.
      # we have to change into the directory containing the app, and install our npm dependencies.
      - name: Install NPM Packages 
        run: |
          cd app
          npm install

      # build and export generates the static HTML files into ./out
      # creating a .nojekyll file is necessary to prevent Jekyll from removing some essential files
      - name: Build and publish static site 
        run: |
          cd app
          npm run build && npm run export && touch ./out/.nojekyll 

      # This action, created by James Ives takes the contents of a designated folder,
      # and dumps it into the root of a branch of your choice.
      # This makes it accessible for deployment to Github Pages!
      - name: Deploy 🚀
        uses: JamesIves/github-pages-deploy-action@4.1.4
        with:
          branch: gh-pages # The branch the action should deploy to.
          folder: ./app/out # The folder the action should deploy.
      
      - run: echo "🍏 This job's status is ${{ job.status }}."
```

Some gotchas I encountered while figuring out how were 
* Adding an empty .nojekyll file in my app's folder. This is important since GitHub Pages runs a Jekyll routine upon deployment, which will discard any files/folders that begin with _. Next.JS just so happens to place all Javascript files into a folder named _Next, which Jekyll deletes if the file is not present, which is behaviour we definitely do not want. 
* Another was how to actually deploy the site properly to a root `/` or `/docs` location so that Pages could properly pick that up. Luckily, I stumbled upon this user-developed Github action https://github.com/JamesIves/github-pages-deploy-action that did the job painlessly and cleanly for me.

I now have a workflow set up where every commit made (blog post added/updated, or edits to the site itself) triggers the Github Actions workflow to deploy the site with the newest changes/posts, completely automagically! 

<p align="center">
  <img src="../public/assets/blog/hello-world/great-success.png">
</p>

# Angular Table Editor 

**

** This project has been ported to Angular 2+ and is not being maintained (nor was it even ever finished). Check out [@ngx-table-editor](https://github.com/maurei/ngx-table-editor).**

---
#### AngularJS library that transforms dull HTML tables into dynamic editable components
---
**[See the project page for examples and documentation](https://maurei.github.io/angular-table-editor/)**

---

## Getting Started

1. download the package and include the supplied JS file in your HTML. Currently its not hosted via CDN (yet).

    ```html
    <script type='text/javascript' src='lib/angular-table-editor.js'></script>
    ```

    Or if you're using a precompiler, download via npm
    ```
    $ npm install angular-table-editor --save-dev
    ```

    and import the library in your javascript

    ```js
    import ngTableEditor from 'angular-table-editor'
    ```


2. include  `ngTableEditor` in your project as a dependency

    ```js
    angular.module('myApp', ['ngTableEditor'])
    ```


And you should be good to go :>


## Reasons for this project
This project is an open source spin-off of an internal application for an accountancy firm that I've been working for. Their internal platform often involves views with large amounts of data (tables) that needs to be editable. 
Other libraries, such as esvit's powerful [ngTable](http://ng-table.com/#/editing/demo-inline) offer a solution to the problem of having to render too many HTML input elements with negative performance effects, yet they require more interaction in order to alter data: clicking, popup boxes, confirming, etc. I wanted to bring an MS Excel-like experience of editting data to HTML tables the way accountants would like it. That mostly implies a fully keyboard controllable and row-oriented way of editting data.

## Goals for this project
* Unfortunately, I have not written any tests :<
* Getting rid of memory leaks (currently working on this)
* Create a more comprehensive API documentation
* Get rid of jQuery dependency (getting close)
* Eventually, migrate the project to Angular 4.

## Development
You're more than welcome to work on this project with me :>. I've tried to make things a bit easier to get stuff up and running.

1. Clone the project, `cd` into the folder, run `npm install --dev` 
2. At this point, there's a bunch of npm commands available.
    * `npm run dev` gets a webpack watcher up and running on contents of `src`, which contains the source code of the library.
    * `npm run build-demo` will install everything needed to get the [demo page](https://maurei.github.io/angular-table-editor/) up and running locally, which you can use for development.
    *  `npm run dev-withdemo` will get webpack up and running for both the demo and the library source code, and will launch the demo on (by default) localhost:8000. You may use this as a starting point for development instead of creating your own environment from scratch, if you wish. Don't forget to run `npm run build-demo` first!
3.  Do some awesome fixes, and make a pullrequest :>


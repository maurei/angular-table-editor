# Angular Table Editor 

**Note: This package is still under construction, more advanced usage may come with bugs. Check out the documentation to see which parts are solid and which are less solid**

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


And you should be good to go =)


## Reasons for this project
This project is an open source spin-off of an internal application for an accountancy firm that I've been working for. Their internal platform often involves views with large amounts of data (tables) that needs to be editable. Other libraries, such as esvit's powerful [ngTable](http://ng-table.com/#/editing/demo-inline) offer a solution to the problem of having to render too many HTML input elements with negative performance effects, yet they require more interaction in order to alter data: clicking, popup boxes, confirming, etc. I wanted to bring an MS Excel-like experience of editting data to HTML tables the way accountants would like it. That mostly implies a fully keyboard controllable and row-oriented way of editting data

## Goals for this project
* Unfortunately, I have not written any tests :-(
* Getting rid of memory leaks (currently working on this)
* Create a more comprehensive API documentation
* Get rid of jQuery dependency (getting close)
* Eventually, migrate the project to Angular 4.


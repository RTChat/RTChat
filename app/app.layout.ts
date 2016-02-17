import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    // template: '<h1>My First Angular 2 App</h1>'
    template: `
    	<div id="top-bar">Top Bar</div>
    	<div id="main-bar">
	    	<div id="side-bar">Side Bar</div>
	    	<div id="game-panel">Game Panel</div>
	    	<div id="side-bar" class="right">Right Side Bar</div>
	    </div>
    	<div id="bottom-bar">Bottom Bar</div>
	`
})

export class AppLayout { }
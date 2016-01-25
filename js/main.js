function Diagram () {

	if ( !(this instanceof Diagram) )
		return new Diagram();

    var LEGEND_HEIGHT = this.LEGEND_HEIGHT = 56;

    var diagramLayoutOptions = this.diagramLayoutOptions = {
        name: "breadthfirst",
        fit: true,
        directed: false,
        padding: 0,
        avoidOverlap: true,
        animate: true,
        animationDurection: 500
    };

    this.legendInitialPosition = new vec2d(34, 29.5);
    this.LEGEND_SEPARATION = new vec2d(50, 0);

	this.selection = [];

    this.legend = [
        {
            selected: false,
            selectable: true,
            locked: false,
            grabbable: true,

            position: this.legendInitialPosition,

            data: {
                isLegend: true,
                id: "process",
            },

            style: {
                shape: "rectangle",
                width: 48
            }
        }, 
        {
            selected: false,
            selectable: false,
            locked: true,
            grabbable: false,

            position: this.legendInitialPosition.add(
                this.LEGEND_SEPARATION
            ),

            data: {
                isLegend: true,
                id: "decision"
            },

            style: {
                shape: "polygon",
                "shape-polygon-points": "0 -1 1 0 0 1 -1 0"
            }
        }
    ];

    var cyStyles;

    var cyStyles_jqhr = $.ajax({
        url: "/css/node-styles.css",
        data: null,
        dataType: "text/css",
        success: function (data) {
            cyStyles = data;
        }
    });

    this.layouts = {
        breadthfirst: {
            name: "breadthfirst",
            fit: true,
            directed: true,
            avoidOverlap: true
        }
    };

    this.cy = cytoscape({
        container: $("#diagram #container")[0],
        elements: this.legend,
        style: cyStyles,
        layout: this.layouts.breadthfirst,

        zoom: 1,
        minZoom: 0.2,
        maxZoom: 1.8,
        zoomingEnabled: true,
        userZoomingEnabled: true,
        panningEnabled: true,
        userPanningEnabled: true
    });

    this.cy.reset();

    $(window).on("keyup", this.wrap(function (event) {
    	console.log("keypress", event.which);
    	switch(event.which) {
    		case 46:
    			_delete();
   			break;

			case 68:
				debug();
			break;

   			case 83:
   				if (event.shiftKey && event.ctrlKey)
   					save();
   			break;

   			case 76:
   				if (event.shiftKey && event.ctrlKey)
   					load();

   			case 13:
				var parent = selectionData.selected[ 0 ] || undefined;
	    		var child = selectionData.selected[ 1 ] || undefined;
   				if (!connect(parent, child))
   					layout();
   			break;

   			default:
   			break;
    	}
    }));
    
    this.cy.on("select", 		this.wrap(this.select));
    this.cy.on("unselect", 		this.wrap(this.unselect));
    this.cy.on("click", "node", this.wrap(this.spawn));

    window.addEventListener('resize', this.wrap(this.layout), true);
}

Diagram.prototype.save = function save () {
	//TODO
	prompt("Save", JSON.stringify(
		this.cy.json()
	));
}

Diagram.prototype.load = function load () {
	this.cy.json(
		JSON.parse(
			prompt("Load")
		)
	);
	
	this.layout();
}

Diagram.prototype.remove = function remove () {
	this.cy.remove(":selected");
}

Diagram.prototype.layout = function layout () {

	this.cy.layout(
		this.layouts.breadthfirst
	);
};

Diagram.prototype.select = function select (event) {
	
	this.selection.push(event.cyTarget);
};

Diagram.prototype.unselect = function unselect (event) {

	var targetIndex = this.selection.indexOf(event.cyTarget);

	if ( targetIndex != -1 )
		this.selection.splice(targetIndex, 1);
};

Diagram.prototype.connect = function connect (parent, child) {

	if (parent && child) {
		var label = prompt("Label (leave empty to skip): ");
   		var num_elements = this.cy.elements().length;

		parent = parent.data().id;
		child = child.data().id;

		this.cy.add({
			group: "edges",
            selected: false,
            selectable: true,
            locked: false,
            grabbable: true,

            data: {
            	id: (parent + " -> " + child + " " + num_elements),
            	source: parent,
            	target: child,
            	label: label
            }
		});

		return true;
	}

	return false;
}

Diagram.prototype.click = function click (event) {

	    this.cy.startBatch();

        var label = prompt("Label: ");

        var parent = this.selection[ 0 ] || undefined;
        var child  = this.selection[ 1 ] || undefined;

		var target = event.cyTarget;

        if ( label.length > 0 ) {

		    var element = this.cy.add(
		    	target
		    );
		    
   		    element.selectify();
		    element.grabify();
		    element.unlock();
		    
		    this.connect(parent, element);
		    this.connect(element, child);

		}
		
		this.layout();
	    
	    this.cy.endBatch();
};

Diagram.prototype.wrap = function wrap (fn) {

	var ctx = this;
	var user_args = []; // Sane defaults in case arguments.length <= 1
	
	if (arguments.length > 1) {
		user_args = Array.prototype.splice.call(
			arguments, 
			[1, arguments.length]
		);
	}

	function wrap_handler (fn, args, event) {
		fn.apply(this, [event].concat(args[0]));
	}
	
	// Wrap user args in an extra layer of array,
	//  it's either that or unpack stuff in wrap_handler
	//  and since this is faster...
	return wrap_handler.bind.apply(wrap_handler, [ctx].concat([fn, [user_args]]));
};

$(function () {
	document.diagram = new Diagram();
});

function Diagram () {

	if ( !(this instanceof Diagram) )
		return new Diagram();

    var LEGEND_HEIGHT = this.LEGEND_HEIGHT = 56;

    var diagramLayoutOptions = this.diagramLayoutOptions = {
        name: "breadthfirst",
        fit: true,
        directed: false,
        padding: 30,
        avoidOverlap: true,
        animate: true,
        animationDurection: 500
    };

    var legendLayoutOptions = this.legendLayoutOptions = {
    	name: "preset",
    	fit: true
    };

    var legendInitialPosition = new vec2d(34, 29.5);

    legendLayoutOptions["height"] = LEGEND_HEIGHT;

    var selectionData = {
    	selected: []
    };

    var legend = this.legend = cytoscape({
        container: document.getElementById("legend"),
        zoomingEnabled: false,
        panningEnabled: false,
        boxSelectionEnabled: false,
        layout: legendLayoutOptions,

        elements: [{
			shape: "roundrectangle",
            selected: false,
            selectable: true,
            locked: false,
            grabbable: true,
            width: "42px",

            position: legendInitialPosition,

            data: {
                id: "process",
            }
        },
        {
			shape: "triangle",
        	selected: false,
        	selectable: true,
        	locked: false,
        	grabbable: true,
            width: 42,

        	position: legendInitialPosition.add(
        		new vec2d(50, 0)
        	),

        	data: {
        		id: "decision"
        	}
        }]
    });

    var cy = this.cy = cytoscape({

        container: document.getElementById("diagram"),
        zoom: 1,
        minZoom: 0.5,
        maxZoom: 1.5,
        zoomingEnabled: true,
        userZoomingEnabled: true,
        panningEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: true,
        //selectionType: "single",
        fit: true,

        elements: [
        ],

        layout: diagramLayoutOptions,

        style: [
            {
                selector: "node",
                style: {
                    content: "data(label)",
                    "text-outline-width": 5,
                    "text-outline-color": "#888",
                    "color": "#FFF"
                }
            },

            {
                selector: "edge",
                style: {
                    content: "data(label)",
                    "target-arrow-shape": "triangle",
                    "text-outline-width": 2,
                    "text-outline-color": "#888",
                    "color": "#FFF"
                }
            },

            {
              selector: '.center-center',
              style: {
                'text-valign': 'center',
                'text-halign': 'center'
              }
            }
        ]
    });

    cy.reset();

    function newnodes () {

        cy.startBatch();

        var label = prompt("Label: ");
        var activation = prompt("Activation data (json): ");

        var parent = selectionData.selected[ 0 ] || undefined;
        var child  = selectionData.selected[ 1 ] || undefined;

        if ( label.length > 0 ) {

		    var elements = [];

		    elements.push(
		        {
		            group: "nodes",
		            data: {
		                id: label,
		                label: label,
		                activation: activation,
		                classes: "center-center"
		            },

		            position: {
		                x: 50,
		                y: 200
		            }
		        }
		    );

		    if ( parent ) {
		    	var id = parent.data().id;

		    	elements.push({
                    group: "edges",
                    selected: false,
                    selectable: true,
                    locked: false,
                    grabbable: true,

                    data: {
                    	id: (id + "->" + label),
                    	source: id,
                    	target: label
                    }
		    	});
		    }

		    if ( child ) {
		    	var id = child.data().id;

		    	elements.push({
                    group: "edges",
                    selected: false,
                    selectable: true,
                    locked: false,
                    grabbable: true,

                    data: {
                    	id: (label + "->" + id),
                    	source: label,
                    	target: id
                    }
		    	});
		    }

		    cy.endBatch();

			for (element in elements)
				if (elements.hasOwnProperty(element))
					cy.add(elements[element]);
		}

	    cy.layout(diagramLayoutOptions);
    }

    function onselection (event) {

		selectionData.selected.push(event.cyTarget);

        event.cyTarget.style({
            "background-color": "#000",
            "text-outline-color": "#000",

            "target-arrow-color": "#000",
            "line-color": "#000"
        });
    }

    function onunselection (event) {

		var targetIndex = selectionData.selected.indexOf(event.cyTarget);

		if ( targetIndex != -1 )
			selectionData.selected.splice(targetIndex, 1);

        event.cyTarget.style({
            "background-color": "#888",
            "text-outline-color": "#888",

            "target-arrow-color": "#ddd",
            "line-color": "#ddd"
        });
    }

    function layout () {
    	cy.layout(diagramLayoutOptions);
    	legend.layout(legendLayoutOptions);
    }

    function delete_connection () {
    	var selection = cy.$(":selected");
    	cy.remove(selection);
    	return true;
    }

    function connect () {
    	var parent = selectionData.selected[ 0 ] || undefined;
    	var child = selectionData.selected[ 1 ] || undefined;

    	if (parent && child) {
    		var label = prompt("Label (leave empty to skip): ");

    		parent = parent.data().id;
    		child = child.data().id;

    		cy.add({
				group: "edges",
                selected: false,
                selectable: true,
                locked: false,
                grabbable: true,

                data: {
                	//id: (parent + " to " + child),
                	source: parent,
                	target: child,
                	label: label
                }
    		});

    		return true;
    	}

    	return false;
    }

    function save () {
    	//TODO
    	prompt("Data: ", JSON.stringify(cy.json()));
    	layout();
    }

    function load () {
    	cy.json(JSON.parse(prompt("Data: ")));
    }

    $(window).on("keypress", function (event) {
    	console.log("keypress", event.which);
    	switch(event.which) {
    		case 0:
    			delete_connection();
   			break;

   			case 19:
   				if (event.shiftKey && event.ctrlKey)
   					save();
   			break;

   			case 12:
   				if (event.shiftKey && event.ctrlKey)
   					load();

   			case 13:
   				if (!connect())
   					layout();
   			break;

   			default:
   			break;
    	}
    });

    cy.on("select",   "node", onselection);
    cy.on("unselect", "node", onunselection);
    cy.on("select",   "edge", onselection);
    cy.on("unselect", "edge", onunselection);

    legend.nodes().on("click", newnodes);

    window.addEventListener('resize', layout, true);
}

$(function () {
	document.diagram = new Diagram();
});

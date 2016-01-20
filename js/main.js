function Diagram () {

	if ( !(this instanceof Diagram) )
		return new Diagram();

    var LEGEND_HEIGHT = this.LEGEND_HEIGHT = 56;
	var LEGEND_SEPARATION = this.LEGEND_SEPARATION = 50;

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

    var legendInitialPosition = this.legendInitialPosition = new vec2d(34, 29.5);

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
            selected: false,
            selectable: true,
            locked: false,
            grabbable: true,

            position: legendInitialPosition,

            data: {
                id: "process",
            },

			style: {
				shape: "rectangle",
				width: 48
			}
        },
        {
        	selected: false,
        	selectable: true,
        	locked: false,
        	grabbable: true,

        	position: legendInitialPosition.add(
        		new vec2d(LEGEND_SEPARATION, 0)
        	),

        	data: {
        		id: "decision"
        	},

			style: {
				shape: "polygon",
				"shape-polygon-points": "0 -1 1 0 0 1 -1 0"
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
                    "color": "#FFF",
					"background-color": "#888"
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

    function newnodes (event) {

        cy.startBatch();

        var label = prompt("Label: ");
        var activation = prompt("Node activation data/logic (json): ");

        var parent = selectionData.selected[ 0 ] || undefined;
        var child  = selectionData.selected[ 1 ] || undefined;
		var target = event.cyTarget;
		var num_elements = cy.elements().length;

        if ( label.length > 0 ) {

		    var elements = [];

		    var element = cy.add(
		        {
		            group: "nodes",
		            data: {
		                id: label + num_elements,
		                label: label,
		                activation: activation,
		                classes: "center-center"
		            },

		            position: {
		                x: 50,
		                y: 200
		            },

					style: target.style()
		        }
		    );

		    if ( parent ) {
				var pid = parent.data().id;
		    	var cid = element.data().id;

				activation = prompt("Connection activation data/logic (json): ");

		    	elements.push({
                    group: "edges",
                    selected: false,
                    selectable: true,
                    locked: false,
                    grabbable: true,

                    data: {
                    	id: (pid + "->" + cid + num_elements),
                    	source: pid,
                    	target: cid,
						activation: activation
                    }
		    	});
		    }

		    if ( child ) {
				var pid = element.data().id;
		    	var cid = child.data().id;

				activation = prompt("Connection activation data/logic (json): ");

		    	elements.push({
                    group: "edges",
                    selected: false,
                    selectable: true,
                    locked: false,
                    grabbable: true,

                    data: {
                    	id: (pid + "->" + cid + num_elements),
                    	source: pid,
                    	target: cid,
						activation: activation
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

    function _delete () {
    	var selection = cy.$(":selected");
    	cy.remove(selection);
    	return true;
    }

    function connect (parent, child) {

    	if (parent && child) {
    		var label = prompt("Label (leave empty to skip): ");
			var activation = prompt("Activation data/logic (json): ");

    		parent = parent.data().id;
    		child = child.data().id;

    		cy.add({
				group: "edges",
                selected: false,
                selectable: true,
                locked: false,
                grabbable: true,

                data: {
                	id: (parent + " to " + child + cy.elements().length),
                	source: parent,
                	target: child,
                	label: label,
					activation: activation
                }
    		});

    		return true;
    	}

    	return false;
    }

    function save () {
    	//TODO
    	prompt("Save", JSON.stringify(cy.json()));
    	layout();
    }

    function load () {
    	cy.json(JSON.parse(prompt("Load")));
    }

	function debug () {
		var selection = cy.$(":selected").collection();

		for (element in selection)
			if (selection.hasOwnProperty(element))
				try {
					console.log(selection[element].data().id);
				}
				catch (e) {}
	}

    $(window).on("keyup", function (event) {
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

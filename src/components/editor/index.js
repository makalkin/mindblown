import React from "react";
import {
  Sidebar,
  Segment,
  Button,
  Menu,
  Icon,
  Header,
  Input,
  Popup
} from "semantic-ui-react";

import FileSaver from 'file-saver';

import shortid from "shortid";
import styled from "styled-components";

import cytoscape from "cytoscape";
import resize from "cytoscape-node-resize";
import konva from "konva";
import $ from "jquery";

import spread from "cytoscape-spread";
import dagre from 'cytoscape-dagre'

import tutorialMenu from "./tutorial/menu.png";
import tutorialControls from "./tutorial/controls.png";

cytoscape.use(spread);
cytoscape.use(dagre)

resize(cytoscape, $, konva);



const EditorContainer = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
`;

const PopupMenu = styled.div`
  display: ${({ show }) => (show ? "block" : "none")};
  position: absolute;
  left: ${props => props.left}px;
  top: ${props => props.top - 30}px;
  z-index: 1000;
`;

const MainMenu = styled(Menu) `
  border: 0 ;important!;
  border-radius: 0; important!
  margin: 0; important!
`;

export class Editor extends React.Component {
  state = {
    visible: false,
    popup: {
      show: false,
      edit: false
    },
    // layout: {
    //   name: 'concentric',

    //   padding: 30, // the padding on fit
    //   startAngle: 3 * Math.PI, // where nodes start in radians
    //   sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
    //   clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
    //   equidistant: false, // whether levels have an equal radial distance betwen them, may cause bounding box overflow
    //   // minNodeSpacing: 10, // min spacing between outside of nodes (used for radius adjustment)
    //   // boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    //   // avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
    //   // nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
    //   // height: undefined, // height of layout area (overrides container height)
    //   // width: undefined, // width of layout area (overrides container width)
    //   spacingFactor: 1, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
    //   concentric: function (node) { // returns numeric value for each node, placing higher nodes in levels towards the centre
    //     const rank = -node.cy().elements().aStar({ goal: `#${node.id()}`, root: '#root' }).distance
    //     return rank;
    //   },
    //   levelWidth: (nodes) => {
    //     return 10;
    //   },
    //   // levelWidth: function( nodes ){ // the letiation of concentric values in each level
    //   // return nodes.maxDegree() / 4;
    //   // },
    //   // animate: false, // whether to transition the node positions
    //   // animationDuration: 500, // duration of animation in ms if enabled
    //   // animationEasing: undefined, // easing of animation if enabled
    //   // animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
    //   // ready: undefined, // callback on layoutready
    //   // stop: undefined, // callback on layoutstop
    //   // transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts 
    // },
    // layout: {
    //   name: 'cola',
    //   flow: { axis: 'y', },
    //   avoidOverlaps: true,
    //   unconstrIter: 10,
    //   userConstIter: 20
    // },
    layout: {
      name: 'dagre',
      // dagre algo options, uses default value on undefined
      nodeSep: 200, // the separation between adjacent nodes in the same rank
      edgeSep: 200, // the separation between adjacent edges in the same rank
      rankSep: 300, // the separation between adjacent nodes in the same rank
      rankDir: "LR", // 'TB' for top to bottom flow, 'LR' for left to right,
      ranker: 'network-simplex', // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
      minLen: function (edge) { return 1.5; }, // number of ranks to keep between the source and target of the edge
      // edgeWeight: function (edge) { console.log(edge); return 0.1; }, // higher weight edges are generally made shorter and straighter than lower weight edges

      // general layout options
      fit: false, // whether to fit to viewport
      padding: 100, // fit padding
      // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
      nodeDimensionsIncludeLabels: true, // whether labels should be included in determining the space used by a node (default true)
      animate: false, // whether to transition the node positions
      // animationDuration: 2, // duration of animation in ms if enabled

    },

    // layout: {
    //   name: "spread",
    //   fit: false,
    //   animate: true,
    //   minDist: 800,
    //   padding: 20,
    //   expandingFactor: -1,
    //   randomize: true
    // }
    // layout: {
    //   name: "breadthfirst",
    //   fit: true,
    //   animate: true,
    //   directed: false,
    //   circle: true,
    //   avoidOverlap: true,
    //   padding: 50,
    //   maximalAdjustments: 2,
    //   spacingFactor: 1.5
    // }
    // activeNode: null,
    // layout: {
    //   animate: true,
    //   name: "breadthfirst",
    //   circle: true,
    //   avoidOverlap: true,
    //   spacingFactor: 1,
    //   directed: true,
    //   fit: true
    // }
    // layout: {
    //   name: "cose",
    //   padding: 80,
    //   componentSpacing: 200,
    //   nodeOverlap: 200,
    //   gravity: 5,
    //   fit: true,
    //   animationThreshold: 1000,
    //   nodeDimensionsIncludeLabels: true,
    //   animate: "end",
    //   animateFilter: function(node, i) {
    //     return true;
    //   },
    //   idealEdgeLength: function(edge) {
    //     return 132;
    //   },
    //   edgeElasticity: function(edge) {
    //     return 112;
    //   },
    //   initialTemp: 5000,
    //   nestingFactor: 20
    // }
    // layout: {
    //   name: "grid",
    //   avoidOverlap: false, // prevents node overlap, may overflow boundingBox if not enough space
    //   avoidOverlapPadding: 10,
    //   nodeDimensionsIncludeLabels: true
    // }
  };

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  componentDidMount() {
    this.cy = cytoscape({
      motionBlur: true,
      wheelSensitivity: 0.07,
      container: document.getElementById("editor"),
      elements: [
        // list of graph elements to start with
        {
          // node a
          data: {
            id: "root",
            renderedPosition: {
              x: window.innerWidth / 2,
              y: window.innerHeight / 2
            },
            description: "How to use?"
          }
        },
        {
          data: {
            id: "menu",
            description: "Action Menu"
          }
        },
        {
          data: {
            id: shortid.generate(),
            source: "root",
            target: "menu"
          }
        },
        {
          data: {
            id: "nodes",
            description: "Hover over the node"
          }
        },
        {
          data: {
            id: shortid.generate(),
            source: "root",
            target: "nodes"
          }
        },
        {
          data: {
            id: "plus",
            description: "Adds child"
          },
          classes: "empty"
        },
        {
          data: {
            id: shortid.generate(),
            source: "nodes",
            target: "plus"
          }
        },
        {
          data: {
            id: "pencil",
            description: "Edit label"
          },
          classes: "empty"
        },
        {
          data: {
            id: shortid.generate(),
            source: "nodes",
            target: "pencil"
          }
        },
        {
          data: {
            id: "img",
            description: "Attach image"
          },
          classes: "empty"
        },
        {
          data: {
            id: shortid.generate(),
            source: "nodes",
            target: "img"
          }
        },
        {
          data: {
            id: "trash",
            description: "Remove node and children"
          },
          classes: "empty"
        },
        {
          data: {
            id: shortid.generate(),
            source: "nodes",
            target: "trash"
          }
        }
      ],

      style: [
        // the stylesheet for the graph
        {
          selector: "node",
          style: {
            width: "100",
            shape: "bottomroundrectangle",
            height: "100",
            "font-size": "40px",
            label: "data(description)",
            padding: 10,
            "background-fit": "contain",
            "text-wrap": "wrap",
            "text-max-width": "500",
            "border-width": "1",
            "background-color": "#eee"
          }
        },
        {
          selector: ".empty",
          style: {
            shape: "roundrectangle",
            width: "label",
            height: "label",
            "font-size": "40px",
            "text-valign": "center",
            "text-halign": "center",
            // "text-outline-width": "2px",
            "overlay-padding": "6px",
            "z-index": "10"
          }
        },
        {
          selector: "#root",
          style: {
            "background-image":
              "https://pbs.twimg.com/media/CMDORZ0WsAAJXSS.png",
            "background-fit": "contain",

            width: "200",
            height: "200"
          }
        },
        {
          selector: "#menu",
          style: {
            "background-image": tutorialMenu,
            width: "418",
            height: "222"
          }
        },
        {
          selector: "#nodes",
          style: {
            "background-image": tutorialControls,
            width: "472",
            height: "252"
          }
        },

        {
          selector: "edge",
          style: {
            "curve-style": "bezier",
            "control-point-step-size": 10,
            "control-point-weight": 0.33,
            "edge-distances": "node-position",
            // "control-point-distances": [20, -20],
            // "control-point-weights": [0.25, 0.75],
            width: 5,
            "line-color": "#4286f4",
            "target-arrow-color": "#4286f4",
            "target-arrow-shape": "triangle"
          }
        }
      ],

      layout: this.state.layout
    });

    this.refreshLayout();

    // this.layout = this.cy.layout(this.state.layout)
    // this.layout.pon('layoutstop').then(event => {
    //   this.cy.center(this.cy.$('#root'))
    // });

    // console.log(this.cy.nodes("#root"));
    // this.setState({
    //   layout: { ...this.state.layout, roots: this.cy.nodes("#root") }
    // });

    this.cy.on("free mouseover", "node", event => {
      const node = event.target;
      this.activeNode = node;
      let { x: left, y: top } = node.renderedPosition();

      top -= node.renderedHeight() / 2;
      left -= node.renderedWidth() / 2;

      this.setState({
        popup: { show: true, top, left }
      });
    });

    this.cy.on("zoom resize layoutstart", () => {
      this.setState({ popup: { show: false } });
    });

    this.cy.on("grab mouseout ", "node", () => {
      this.setState({ popup: { show: false } });
    });

    this.cy.nodeResize();
  }

  render() {
    const { visible, popup } = this.state;
    return [
      <MainMenu
        key="menu"
        style={{ border: 0, borderRadius: 0, margin: 0 }}
        inverted
      >
        <Menu.Item name="home" active={true} onClick={this.toggleVisibility}>
          <Icon name="sidebar" />
        </Menu.Item>
      </MainMenu>,
      <Sidebar.Pushable
        key="sidebar"
        as={Segment}
        style={{ border: 0, borderRadius: 0, margin: 0 }}
      >
        <Sidebar
          as={Menu}
          animation="overlay"
          width="thin"
          visible={visible}
          icon="labeled"
          vertical
          inverted
          style={{ zIndex: 1001 }}
        >
          <Menu.Item name="home" onClick={this.refreshLayout}>
            <Icon name="refresh" />
            Refresh
          </Menu.Item>
          <Menu.Item name="home" onClick={this.fitLayout}>
            <Icon name="grid layout" />
            Fit
          </Menu.Item>
          <Menu.Item name="home" onClick={this.export}>
            <Icon name="external share" />
            Export
          </Menu.Item>
        </Sidebar>
        <Sidebar.Pusher>
          <EditorContainer id="editor" />
        </Sidebar.Pusher>
        <PopupMenu {...popup}>
          <div style={{ position: "relative" }}>
            <Button
              icon="add"
              size="mini"
              circular
              color="green"
              onClick={this.addNode}
            />

            <Popup
              flowing
              hoverable
              on={["click"]}
              open={this.state.popup.edit}
              trigger={
                <Button size="mini" icon="pencil" circular color="blue" />
              }
            >
              <FocusedInput
                transparent
                focus={true}
                inputRef={node => {
                  this.labelEdit = node;
                }}
                onKeyPress={this.handleLableInputKeyPress}
                onChange={this.editLabel}
                placeholder={
                  this.activeNode && this.activeNode.data("description")
                }
              />
            </Popup>
            <Button
              icon="image"
              circular
              size="mini"
              color="teal"
              onClick={this.openDialog}
            />

            {this.activeNode &&
              this.activeNode.id() !== "root" && (
                <Button
                  icon="trash outline"
                  circular
                  size="mini"
                  color="red"
                  onClick={this.removeNode}
                />
              )}
          </div>
        </PopupMenu>
        <Input
          style={{ display: "none" }}
          ref={node => {
            this.imageInput = node;
          }}
          onChange={this.changeImage(this.activeNode)}
          type="file"
        />
      </Sidebar.Pushable >
    ];
  }

  refreshLayout = async (node) => {
    this.layout = this.cy.layout(this.state.layout)
    this.layout.pon('layoutstop').then(event => {
      const root = this.cy.$('#root')
      // this.cy.center(root)
      // this.cy.fit();
    })
    this.layout.run();
  };

  fitLayout = () => {
    this.cy.fit();
  };

  addNode = () => {
    const node = shortid.generate();
    const edge = shortid.generate();
    this.layout.stop();

    this.cy.add([
      {
        group: "nodes",
        data: { id: node, description: "new node" },
        classes: "empty",
        style: { visibility: 'hidden' }
      },
      {
        group: "edges",
        data: {
          id: edge,
          source: this.activeNode.id(),
          target: node
        },
        style: { visibility: 'hidden' }
      }
    ]);

    this.refreshLayout(this.cy.$(`#${node}`));
    this.cy.$(`#${node}`).style('visibility', 'visible')
    this.cy.$(`#${edge}`).style('visibility', 'visible')

  };

  removeNode = () => {
    this.activeNode.successors().remove();
    this.cy.remove(this.activeNode);
    this.setState({ popup: { show: false } });
  };

  editLabel = (event, data) => {
    this.activeNode.data("description", data.value);
  };

  openDialog = event => {
    this.imageNode = this.activeNode;
    this.imageInput.inputRef.click();
  };

  changeImage = () => {
    const reader = new FileReader();
    let imgSrc;

    reader.onloadend = () => {
      imgSrc = reader.result;
      this.imageNode
        .style({
          "background-image": imgSrc
        })
        .removeClass("empty");
    };

    return event => {
      const img = event.target.files[0];
      reader.readAsDataURL(img);
    };
  };

  handleLableInputKeyPress = event => {
    if (event.key == "Enter") {
      this.setState({ popup: { show: false, edit: false } });
    }
  };

  toggleVisibility = () => {
    this.setState({ visible: !this.state.visible });
  };

  export = () => {
    FileSaver.saveAs(this.cy.png({ output: 'blob', bg: '#fff' }), 'MyMap.png')
    console.log(this.cy.json());
  };
}

class FocusedInput extends React.Component {
  componentDidMount() {
    this.input.focus();
  }

  render() {
    const { inputRef, ...props } = this.props;
    return (
      <Input
        {...props}
        ref={node => {
          this.input = node;
          inputRef(node);
        }}
      />
    );
  }
}

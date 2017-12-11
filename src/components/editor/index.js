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

import shortid from "shortid";
import { debounce } from "lodash";
import styled from "styled-components";

import "./styles.scss";
import gtx from "./gtx.png";

import cytoscape from "cytoscape";
import resize from "cytoscape-node-resize";
import konva from "konva";
import $ from "jquery";

const cy = resize(cytoscape, $, konva);

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
  top: ${props => props.top}px;
  z-index: 1000;
`;

const MainMenu = styled(Menu)`
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
    layout: {
      name: "breadthfirst",
      fit: true,
      animate: true,
      directed: true,
      circle: true,
      avoidOverlap: true,
      maximalAdjustments: 2,
      spacingFactor: 1
    }
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
            description: "Graphics Cards"
          }
        }
        // {
        //   // node b
        //   data: { id: "b" }
        // },
        // {
        //   // edge ab
        //   data: { id: "ab", source: "a", target: "b" }
        // }
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
            "background-fit": "contain",
            "text-wrap": "wrap",
            "text-max-width": "300"
          }
        },
        {
          selector: ".empty",
          style: {
            shape: "roundrectangle",
            width: "label",
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
            "background-image": gtx,
            "background-fit": "contain",
            "background-color": "#666",
            width: "200",
            height: "200"
          }
        },
        {
          selector: "edge",
          style: {
            "curve-style": "unbundled-bezier",
            "control-point-distances": [20, -20],
            "control-point-weights": [0.25, 0.75],
            width: 3,
            "line-color": "#aa0",
            "target-arrow-color": "#aa0",
            "target-arrow-shape": "triangle"
          }
        }
      ],

      layout: this.state.layout
    });

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
      // <Button onClick={this.toggleVisibility}>Toggle Visibility</Button>,
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
        >
          <Menu.Item name="home" onClick={this.refreshLayout}>
            <Icon name="refresh" />
            Refresh
          </Menu.Item>
          <Menu.Item name="home" onClick={this.fitLayout}>
            <Icon name="grid layout" />
            Fit
          </Menu.Item>
          <Menu.Item name="home">
            <Icon name="external share" />
            Export
          </Menu.Item>
        </Sidebar>
        <Sidebar.Pusher>
          <EditorContainer id="editor" />
        </Sidebar.Pusher>
        <PopupMenu {...popup}>
          <div style={{ top: "-2em", position: "relative" }}>
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
      </Sidebar.Pushable>
    ];
  }

  refreshLayout = () => {
    this.cy.layout(this.state.layout).run();
  };

  fitLayout = () => {
    this.cy.fit();
  };

  addNode = () => {
    const id = shortid.generate();
    this.cy.add([
      {
        group: "nodes",
        data: { id, description: "new node" },
        classes: "empty"
      },
      {
        group: "edges",
        data: {
          id: shortid.generate(),
          source: this.activeNode.id(),
          target: id
        }
      }
    ]);

    this.refreshLayout();
  };

  removeNode = () => {
    this.cy.remove(this.activeNode);
    this.setState({ popup: { show: false } });
  };

  editLabel = (event, data) => {
    this.activeNode.data("description", data.value);
  };

  openDialog = event => {
    this.imageInput.inputRef.click();
  };

  changeImage = node => {
    const reader = new FileReader();
    let imgSrc;

    reader.onloadend = function() {
      imgSrc = reader.result;
      node
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
      console.log("yes");
    }
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

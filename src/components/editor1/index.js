import React from "react";
import {
  Sidebar,
  Segment,
  Button,
  Menu,
  Icon,
  Header
} from "semantic-ui-react";

import { Stage, Layer, Rect, Image } from "react-konva";
import { debounce } from "lodash";
import styled from "styled-components";

import Konva from "konva";

import "./styles.scss";
import gtx from "./gtx.png";

class Node extends React.Component {
  state = {
    image: null
  };
  componentDidMount() {
    const image = new window.Image(gtx);
    console.log(gtx);
    image.src = gtx;
    image.onload = () => {
      this.setState({
        image: image
      });
      console.log(image);
    };
  }
  render() {
    return [
      <Rect
        key="rekt"
        cornerRadius={10}
        draggable={true}
        /* onMouseOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onMouseOut={() => {
          document.body.style.cursor = "default";
        }} */
        width={100}
        height={100}
        fill="#ff4444"
      />,
      <Image key="img" image={this.state.image} width={100} height={100} />
    ];
  }
}

export class Editor extends React.Component {
  state = {
    visible: false,
    mapDimensions: {
      height: window.innerHeight,
      width: window.innerWidth
    }
  };

  toggleVisibility = () => this.setState({ visible: !this.state.visible });

  shouldComponentUpdate(nextProps, nextState) {
    console.log(nextState);
    return true;
  }

  componentWillMount() {
    window.addEventListener("resize", debounce(this.updateMapSize, 500));
  }

  relativeScale = stage => {
    let scaleBy = 1.01;

    const { mapDimensions } = this.state;

    window.addEventListener("wheel", function rescaleStage(e) {
      e.preventDefault();
      console.log("wtf");
      const oldScale = stage.scaleX();
      const mousePointTo = {
        x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
        y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
      };
      const newScale = e.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      stage.scale({ x: newScale, y: newScale });
      const newPos = {
        x:
          -(mousePointTo.x - stage.getPointerPosition().x / newScale) *
          newScale,
        y:
          -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
      };
      stage.position(newPos);
      // this.background.width(window.innerWidth / newScale);
      // this.background.height(window.innerHeight / newScale);

      stage.batchDraw();
    });
  };

  dragStage = e => {
    const { x, y } = e.target.position;
    // this.background.position({ x: -x, y: -y });
  };

  updateMapSize = (...args) => {
    this.setState({
      mapDimensions: {
        height: window.innerHeight,
        width: window.innerWidth
      }
    });
  };

  render() {
    console.log("wtf");
    const { visible, mapDimensions } = this.state;
    return (
      <div>
        <Menu inverted secondary>
          <Menu.Item
            name="home"
            active={true}
            onClick={this.toggleVisibility}
          />
        </Menu>
        {<Button onClick={this.toggleVisibility}>Toggle Visibility</Button>}
        <Sidebar.Pushable as={Segment}>
          <Sidebar
            as={Menu}
            animation="push"
            width="thin"
            visible={visible}
            icon="labeled"
            vertical
            inverted
          >
            <Menu.Item name="home">
              <Icon name="home" />
              Home
            </Menu.Item>
          </Sidebar>
          <Sidebar.Pusher>
            <Stage
              ref={stage => {
                if (stage) {
                  this.stage = stage;
                  this.relativeScale(stage.getStage());
                }
              }}
              onDragMove={this.dragStage}
              draggable={true}
              width={mapDimensions.width}
              height={mapDimensions.height}
            >
              {/* <Layer>
                <Rect
                  ref={node => {
                    if (node) {
                      this.background = node;

                      console.log(node);
                    }
                  }}
                  fill="#c8cbd1"
                  width={mapDimensions.width}
                  height={mapDimensions.height}
                />
              </Layer> */}
              <Layer>
                <Node />
              </Layer>
            </Stage>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </div>
    );
  }
}

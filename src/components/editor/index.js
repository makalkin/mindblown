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

import FileSaver from "file-saver";

import shortid from "shortid";
import styled from "styled-components";

import cytoscape from "cytoscape";
import resize from "cytoscape-node-resize";
import konva from "konva";
import $ from "jquery";

import spread from "cytoscape-spread";
import dagre from "cytoscape-dagre";

import tutorialMenu from "./tutorial/menu.png";
import tutorialControls from "./tutorial/controls.png";

cytoscape.use(spread);
cytoscape.use(dagre);

resize(cytoscape, $, konva);

const EditorContainer = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
`;

const PopupMenu = styled.div`
  display: ${({ show }) => (show ? "block" : "none")};
  position: absolute;
  left: ${props => props.left}px;
  top: ${props => props.top - 30}px;
  z-index: 1000;
`;

export class Editor extends React.Component {
  // Початковий стан редактора.
  state = {
    visible: false,
    popup: {
      show: false,
      edit: false
    }
  };

  // Мето життєвого циклу React-компоненти
  componentDidMount() {
    this.layout = {
      // Назва схеми розташування.
      name: "dagre",
      // Відстань між сусідніми рівнями.
      nodeSep: 200,
      // Відстань між сусідніми гілками.
      edgeSep: 200,
      // Відстань між сусідніми елементами в одному рівні.
      rankSep: 300,
      // Спрямування схеми зліва-направо.
      rankDir: "LR",
      // Алгоритм рангування рівнів.
      ranker: "network-simplex",
      // Кількість рангів між елементом та гілкою.
      minLen: function(edge) {
        return 1.5;
      },
      // Авто-форматування вигляду мапи.
      fit: false,
      // Включення ярликів елементів при розрахунку розмірів елементів.
      nodeDimensionsIncludeLabels: true,
      // Відключення анімації.
      animate: false
    };

    this.cy = cytoscape({
      motionBlur: true,
      wheelSensitivity: 0.07,
      container: document.getElementById("editor"),
      elements,
      style,
      layout: this.layout
    });

    this.refreshLayout();

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
      <Menu
        key="menu"
        style={{ border: 0, borderRadius: 0, margin: 0 }}
        inverted
      >
        <Menu.Item name="home" active={true} onClick={this.toggleVisibility}>
          <Icon name="sidebar" />
        </Menu.Item>
      </Menu>,
      <Sidebar.Pushable
        key="sidebar"
        as={Segment}
        style={{
          border: 0,
          borderRadius: 0,
          margin: 0,
          width: "100%",
          height: "calc(100% - 40px)"
        }}
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
            Оновити
          </Menu.Item>
          <Menu.Item name="home" onClick={this.fitLayout}>
            <Icon name="grid layout" />
            Умістити
          </Menu.Item>
          <Menu.Item name="home" onClick={this.export}>
            <Icon name="external share" />
            Експортувати
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
      </Sidebar.Pushable>
    ];
  }

  refreshLayout = node => {
    this.cylayout = this.cy.layout(this.layout);
    this.cylayout.pon("layoutstop").then(event => {
      const root = this.cy.$("#root");
      // this.cy.center(root)
      // this.cy.fit();
    });
    this.cylayout.run();
  };

  fitLayout = () => {
    this.cy.fit(null, 25);
  };

  addNode = () => {
    const node = shortid.generate();
    const edge = shortid.generate();
    this.cylayout.stop();

    this.cy.add([
      {
        group: "nodes",
        data: { id: node, description: "new node" },
        classes: "empty",
        style: { visibility: "hidden" }
      },
      {
        group: "edges",
        data: {
          id: edge,
          source: this.activeNode.id(),
          target: node
        },
        style: { visibility: "hidden" }
      }
    ]);

    this.refreshLayout(this.cy.$(`#${node}`));
    this.cy.$(`#${node}`).style("visibility", "visible");
    this.cy.$(`#${edge}`).style("visibility", "visible");
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
    FileSaver.saveAs(this.cy.png({ output: "blob", bg: "#fff" }), "MyMap.png");
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

const elements = [
  {
    data: {
      id: "root",
      renderedPosition: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      },
      description: "Як користуватись?"
    },
    style: {
      "background-image": "https://pbs.twimg.com/media/CMDORZ0WsAAJXSS.png",
      "background-fit": "contain",

      width: "388",
      height: "222"
    }
  },
  {
    data: {
      id: "menu",
      description: "Панель інструментів вгорі зліва."
    },
    style: {
      "background-image": tutorialMenu,
      width: "418",
      height: "222"
    }
  },
  {
    data: {
      id: "refresh",
      description: "Відновити позиції."
    },
    classes: "empty"
  },
  {
    data: {
      id: shortid.generate(),
      source: "menu",
      target: "refresh"
    }
  },
  {
    data: {
      id: "fit",
      description: "Умістити карту на екрані."
    },
    classes: "empty"
  },
  {
    data: {
      id: shortid.generate(),
      source: "menu",
      target: "fit"
    }
  },
  {
    data: {
      id: "export",
      description: "Зберегти зображення."
    },
    classes: "empty"
  },
  {
    data: {
      id: shortid.generate(),
      source: "menu",
      target: "export"
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
      description: "Підменю редагування відкривається при наведені на елемент."
    },
    style: {
      "background-image": tutorialControls,
      width: "472",
      height: "252"
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
      description: "Додавання елементів."
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
      description: "Редагування ярликів."
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
      description: "Прикріплення зображень."
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
      description: "Видалення елементів."
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
];
const style = [
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
      padding: 10,
      "font-size": "40px",
      "text-valign": "center",
      "text-halign": "center",
      // "text-outline-width": "2px",
      "overlay-padding": "6px",
      "z-index": "10"
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
];

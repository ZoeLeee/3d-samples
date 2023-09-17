import { explode } from "@/engine/babylonjs/render-list/model-viewer/explode";
import { ZoomAll, zoomToNode } from "@/engine/utils";
import { CarryOutOutlined } from "@ant-design/icons";
import {
  ArcRotateCamera,
  Color3,
  Mesh,
  Scene,
  TransformNode,
} from "@babylonjs/core";
import { Button, Tree } from "antd";
import type { DataNode } from "antd/es/tree";
import React, { useCallback, useMemo, useState } from "react";

const map = new Map<number, Mesh | TransformNode>();

const parse = (nodes: (Mesh | TransformNode)[]) => {
  const tree: DataNode[] = [];

  for (const node of nodes) {
    map.set(node.uniqueId, node);
    tree.push({
      title: node.name,
      key: node.uniqueId,
      icon: <CarryOutOutlined />,
      children: parse(node.getChildren()),
    });
  }

  return tree;
};

export const NodeTree: React.FC<{
  nodes: (Mesh | TransformNode)[];
  scene: Scene;
}> = ({ nodes, scene }) => {
  const [isExplode, setExplode] = useState(false);

  const tree = useMemo(() => {
    map.clear();
    return parse(nodes);
  }, [nodes, scene]);

  const animation = useMemo(() => {
    return explode(nodes[0]);
  }, [nodes[0]]);

  const resetAll = () => {
    const nodes = map.values();
    for (const node of nodes) {
      if (node instanceof Mesh && node.geometry) {
        node.renderingGroupId = 0;
        node.visibility = 1;
        if (
          "emissiveColor" in node.material &&
          node.material?.metadata?.emissiveColor
        ) {
          node.material.emissiveColor = node.material?.metadata?.emissiveColor;
        }
      }
    }
  };

  const highlight = (selectedKeys: React.Key[]) => {
    const cache = new Set();

    const h = (node: Mesh) => {
      if ("emissiveColor" in node.material) {
        if (!node.material.metadata?.emissiveColor) {
          node.material.metadata = {
            emissiveColor: node.material.emissiveColor,
          };
        }
        node.material.emissiveColor = Color3.Gray();
      }
      node.visibility = 1.0;
      node.renderingGroupId = 1;
      node.material.transparencyMode = 2;
    };

    const r = (node: Mesh) => {
      if (
        "emissiveColor" in node.material &&
        node.material?.metadata?.emissiveColor
      ) {
        node.material.emissiveColor = node.material?.metadata?.emissiveColor;
      }
      node.visibility = 0.1;
      node.renderingGroupId = 0;
      node.material.transparencyMode = 2;
    };

    const nodes = map.values();

    for (const node of nodes) {
      if (cache.has(node.uniqueId)) continue;

      if (node instanceof Mesh && node.geometry) {
        if (selectedKeys.includes(node.uniqueId)) {
          h(node);
        } else {
          r(node);
        }
      } else {
        if (selectedKeys.includes(node.uniqueId)) {
          const ms = node.getChildren();
          for (const m of ms) {
            if (m instanceof Mesh && m.geometry) {
              cache.add(m.uniqueId);
              h(m);
            }
          }
        }
      }
    }
  };

  const onSelect = useCallback(
    (selectedKeys: React.Key[], info: any) => {
      zoomToNode(
        map.get(selectedKeys[0] as number),
        scene.activeCamera as ArcRotateCamera
      );

      for (const k of selectedKeys) {
        const node = map.get(k as number);
        const ms = node.getChildren();
        if (ms.length > 0 && ms.every((m) => !m["geometry"])) {
          resetAll();
          return;
        }
      }

      highlight(selectedKeys);
    },
    [scene]
  );

  const toggleExplode = () => {
    setExplode(!isExplode);

    if (!isExplode) {
      resetAll();
      ZoomAll(scene.activeCamera as ArcRotateCamera, scene);
      animation.start();
    } else {
      animation.start(false, 1, animation.to, 0);
    }
  };

  return (
    <>
      <Tree
        showLine
        showIcon
        onSelect={onSelect}
        treeData={tree}
        defaultExpandAll
      />
      <div className="fixed bottom-8 w-full flex justify-center">
        <Button onClick={toggleExplode}>
          {isExplode ? "取消分解" : "分解"}
        </Button>
      </div>
    </>
  );
};

import { onMounted, onUnmounted, Ref } from 'vue';
import { App, EventArgs, Konva, KonvaNode } from '@pictode/core';
import { injectWithSelfStrict, useCommandComponent } from '@pictode/vue-aide';

import ContextMenu from '@/components/ContextMenu.vue';
import { PictodeHotKeyActionsKey } from '@/constants/inject-key';
import { hotKey2String } from '@/utils';

export const useContextMenu = (app: App, selected: Ref<Array<KonvaNode>>) => {
  const contextMenu = useCommandComponent(ContextMenu);
  const {
    moveDown,
    moveUp,
    moveBottom,
    moveTop,
    deleteNode,
    selectAll,
    resetStage,
    undo,
    redo,
    makeGroup,
    decomposeGroup,
  } = injectWithSelfStrict(PictodeHotKeyActionsKey);
  const onContextmenu = ({ event }: EventArgs['mouse:contextmenu']) => {
    event.evt.preventDefault();
    let targetIsStage = false;
    if (event.target instanceof Konva.Stage) {
      targetIsStage = true;
    } else if (!selected.value.find((node) => node.id() === event.target.id())) {
      if (event.target.parent instanceof Konva.Group) {
        app.select(event.target.parent);
      } else {
        app.select(event.target);
      }
    }
    const shapeLayerMenus =
      selected.value.length && !targetIsStage
        ? [
            {
              icon: 'sent-to-back',
              label: moveDown.directions,
              hotKey: hotKey2String(moveDown.hotKey),
              action: moveDown,
            },
            {
              icon: 'bring-to-front',
              label: moveUp.directions,
              hotKey: hotKey2String(moveUp.hotKey),
              action: moveUp,
            },
            {
              icon: 'bring-to-front-one',
              label: moveBottom.directions,
              hotKey: hotKey2String(moveBottom.hotKey),
              action: moveBottom,
            },
            {
              icon: 'send-to-back',
              label: moveTop.directions,
              hotKey: hotKey2String(moveTop.hotKey),
              action: moveTop,
            },
          ]
        : [];
    const groupMenus =
      selected.value.length > 1 && !targetIsStage
        ? [
            {
              icon: 'group',
              label: makeGroup.directions,
              hotKey: hotKey2String(makeGroup.hotKey),
              action: makeGroup,
            },
          ]
        : [];
    const removeGroupMenus =
      selected.value.length === 1 && selected.value[0] instanceof Konva.Group
        ? [
            {
              icon: 'ungroup',
              label: decomposeGroup.directions,
              hotKey: hotKey2String(decomposeGroup.hotKey),
              action: decomposeGroup,
            },
          ]
        : [];
    const shapeDeleteMenus =
      selected.value.length && !targetIsStage
        ? [
            {
              icon: 'delete-one',
              label: deleteNode.directions,
              hotKey: hotKey2String(deleteNode.hotKey),
              action: deleteNode,
            },
          ]
        : [];
    const stageMenus =
      targetIsStage || selected.value.length === 0
        ? [
            {
              icon: 'full-selection',
              label: selectAll.directions,
              hotKey: hotKey2String(selectAll.hotKey),
              action: selectAll,
            },
            {
              icon: 'clear',
              label: resetStage.directions,
              hotKey: hotKey2String(resetStage.hotKey),
              action: resetStage,
            },
          ]
        : [];
    const historyMenus = [
      {
        icon: 'undo',
        label: undo.directions,
        hotKey: hotKey2String(undo.hotKey),
        disable: !app.canUndo(),
        action: undo,
      },
      {
        icon: 'redo',
        label: redo.directions,
        hotKey: hotKey2String(redo.hotKey),
        disable: !app.canRedo(),
        action: redo,
      },
    ];
    const menuGroups = [stageMenus, shapeLayerMenus, groupMenus, removeGroupMenus, historyMenus, shapeDeleteMenus];

    contextMenu({
      x: event.evt.clientX,
      y: event.evt.clientY,
      menuGroups,
    });
  };

  onMounted(() => app.on('mouse:contextmenu', onContextmenu));

  onUnmounted(() => app.off('mouse:contextmenu', onContextmenu));
};

export default useContextMenu;

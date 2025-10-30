import mitt, { Emitter } from 'mitt';


export enum EditorEventType {
  toggleBold = "toggleBold",
  toggleItalics = "toggleItalics",
  toggleLink = "toggleLink",
  toggleBulletList = "toggleBulletList",
  toggleOrderedList = "toggleOrderedList",
  toggleCode = "toggleCode",
  toggleCodeBlock = "toggleCodeBlock",
  editMode = "editMode",
  focus = "focus",
  blur = "blur",
  toggleResize = "toggleResize",
  maximizeSize = "maximizeSize",
}

type EditorEvents = {
  [EditorEventType.toggleBold]: void;
  [EditorEventType.toggleItalics]: void;
  [EditorEventType.toggleLink]: void;
  [EditorEventType.toggleBulletList]: void;
  [EditorEventType.toggleOrderedList]: void;
  [EditorEventType.toggleCode]: void;
  [EditorEventType.toggleCodeBlock]: void;
  [EditorEventType.editMode]: void;
  [EditorEventType.focus]: void;
  [EditorEventType.blur]: void;
  [EditorEventType.toggleResize]: void;
  [EditorEventType.maximizeSize]: void;
};

const emitter = mitt();

export default emitter as unknown as Emitter<EditorEvents>;

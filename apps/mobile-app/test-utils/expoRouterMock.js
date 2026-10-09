const React = require("react");

function Redirect({ href }) {
  return React.createElement("Text", null, `redirect:${href}`);
}

const Stack = Object.assign(
  function Stack({ children }) {
    return React.createElement(React.Fragment, null, children);
  },
  {
    Screen: function StackScreen({ name }) {
      return React.createElement("Text", null, name);
    },
  }
);

const Tabs = Object.assign(
  function Tabs({ children }) {
    return React.createElement(React.Fragment, null, children);
  },
  {
    Screen: function TabScreen({ options }) {
      return React.createElement("Text", null, options?.title ?? "");
    },
  }
);

function NativeTabsTrigger({ children }) {
  return React.createElement(React.Fragment, null, children);
}

NativeTabsTrigger.Label = function NativeTabsLabel({ children }) {
  return React.createElement("Text", null, children);
};

NativeTabsTrigger.Icon = function NativeTabsIcon() {
  return null;
};

const NativeTabs = Object.assign(
  function NativeTabs({ children }) {
    return React.createElement(React.Fragment, null, children);
  },
  {
    Trigger: NativeTabsTrigger,
  }
);

module.exports = { Redirect, Stack, Tabs, NativeTabs };

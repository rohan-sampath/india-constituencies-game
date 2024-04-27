import React from "react";
import ConstituencyGame from "./ConstituencyGame";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";

const App: React.FC = () => {
  return (
    <MantineProvider>
      <ConstituencyGame />
    </MantineProvider>
  );
};

export default App;

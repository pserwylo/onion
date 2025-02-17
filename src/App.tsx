import "./App.css";
import ProjectEditor from "./project/ProjectEditor.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";

function App() {
  return (
    <>
      <Provider store={store}>
        <ProjectEditor />
      </Provider>
    </>
  );
}

export default App;

import ApiClient from "../../api/axios";
import { useState } from "react";
import "./Form.css";

function Form() {
  const [inputs, setInputs] = useState([""]);
  const [urlAddress, setUrlAddress] = useState("");
  const [successResponse, setSuccessResponse] = useState("");
  const [errorResponse, setErrorResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (index, event) => {
    const newInputs = [...inputs];
    newInputs[index] = event.target.value;
    setInputs(newInputs);
  };

  const handleAddInput = () => {
    if (areInputsFilled) {
      setInputs([...inputs, ""]);
    }
  };

  const handleRemoveInput = (index) => {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  };

  const areInputsFilled = inputs.every((input) => input.trim() !== "");

  const defineKeyForCssSelector = (string) => {
    const onlyWords = string.match(/[^\W_]+/)[0];

    if (string.includes("-")) {
      return onlyWords;
    }

    return onlyWords.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
  };

  const mountFieldParams = () => {
    const hash = inputs.reduce((initialValue, value) => {
        if (value[0] !== ".") {
          initialValue.meta.push(value);
          return initialValue;
        }

        const key = defineKeyForCssSelector(value);
        initialValue[key] = value;
        return initialValue;
      },
      { meta: [] }
    );

    return { url: urlAddress, fields: { ...hash } };
  };

  const handleScrapData = async () => {
    if (areInputsFilled) {
      try {
        setLoading(true);
        const params = mountFieldParams();
        const response = await ApiClient().post("/web_page_scraper", params);
        const {
          data: { result },
        } = response;
        setSuccessResponse(result);
        setErrorResponse(undefined);
        return result;
      } catch ({
        response: {
          data: { error },
        },
      }) {
        setErrorResponse(error);
        setSuccessResponse(undefined);
        return error;
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <form className="grid justify-items-center mt-10 mb-10">
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-200 dark:bg-gray-200 dark:border-gray-200 dark:hover:bg-gray-200">
          <div className="group mt-3">
            <input
              id="urlAddress"
              name="urlAddress"
              type="text"
              value={urlAddress}
              className="field-inputs w-full"
              onChange={(event) => setUrlAddress(event.target.value)}
              required
            />
            <span className="highlight"></span>
            <span className="bar"></span>
            <label>URL address</label>
          </div>
          {inputs.map((input, index) => (
            <div key={index} className="flex group" id="fields">
              <input
                id="field"
                name="field"
                type="text"
                className="field-inputs"
                value={input}
                onChange={(event) => handleInputChange(index, event)}
                required
              />
              <span className="highlight"></span>
              <span className="bar"></span>
              <label>CSS Selector Field / Meta</label>
              <button
                type="button"
                className="delete-icon"
                disabled={loading}
                onClick={() => handleRemoveInput(index)}
              >
                X
              </button>
            </div>
          ))}
          <div className="flex justify-between button-div">
            <button
              id="addFieldButton"
              className="bg-blue-500 w-32 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
              onClick={handleAddInput}
            >
              {loading ? "Loading..." : "Add Field"}
            </button>
            <button
              id="startScrapButton"
              className="bg-blue-500 w-32 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
              onClick={handleScrapData}
            >
              {loading ? "Loading..." : "Start Scrap"}
            </button>
          </div>
        </div>
        {successResponse && (
          <div className="mt-10">
            <div className="success-response">
              {JSON.stringify(successResponse, null, 2)}
            </div>
          </div>
        )}
        {errorResponse && (
          <div className="error-response mt-10">{errorResponse}</div>
        )}
      </form>
    </>
  );
}

export default Form;

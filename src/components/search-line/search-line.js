import React, { Component } from "react";
import { Input } from "antd";
import _debounce from "lodash.debounce";

import "./search-line.css";

export default class SearchLine extends Component {
  componentDidMount() {
    document.getElementById("edit").focus();
  }

  render() {
    const { receiveQuery } = this.props;
    const onChangeHandler = (event) => {
      const query = event.target.value;
      //if (!query.trim()) return;
      receiveQuery(query);
    };

    return (
      <div className="input">
        <Input
          size="large"
          id="edit"
          placeholder="Начните вводить название фильма..."
          onChange={_debounce(onChangeHandler, 400)}
          //autoFocus
          //ref={(input) => input && input.focus()}
        />
      </div>
    );
  }
}

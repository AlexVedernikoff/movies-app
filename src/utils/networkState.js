function NetworkState({ onNetworkState }) {
  window.onoffline = () => {
    onNetworkState();
  };
  window.ononline = () => {
    onNetworkState();
  };
}

export default NetworkState;

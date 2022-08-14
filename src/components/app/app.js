import React, { Component } from "react";
import { Spin, Alert, Tabs, Pagination } from "antd";

import SearchLine from "../search-line";
import FilmList from "../film-list";
import "./app.css";
import "antd/dist/antd.min.css";
import constants from "../../constants";
import MoviesService from "../../services/movies-service";
import NetworkState from "../../utils/networkState";
import deepEqual from "../../utils/deepEqual";

const { TabPane } = Tabs;

export default class App extends Component {
  MoviesService = new MoviesService();
  state = {
    isLoading: false,
    error: false,
    films: [],
    query: "",
    page: 1,
    pageRated: 1,
    starsFilms: [],
    totalPages: 0,
    network: false,
    sessionId: null,
    genres: [],
    currentMode: "search"
  };

  onError = () => {
    this.setState({
      error: true,
      isLoading: false
    });
  };

  onNetworkState = () => {
    this.setState((prevState) => ({ network: !prevState.network }));
  };

  createGuestSession() {
    if (!localStorage.getItem("sessionId")) {
      // console.log(
      //   `Поскольку в localStorage нет сохранённого значения гостевой сессии, создаём сессию заново: `
      // );
      this.MoviesService.createSession().then((session) => {
        this.updateStateSessionId(session);
      });
    } else {
      // console.log(
      //   `В localStorage уже хранится значение sessionId и оно равно: `
      // );
      // console.log(localStorage.getItem("sessionId"));
      this.setState({ sessionId: localStorage.getItem("sessionId") });
    }
  }

  componentDidMount() {
    this.createGuestSession();
    this.MoviesService.getGenres().then((genre) => {
      this.updateStateGenres(genre);
    });
  }

  componentDidUpdate() {
    this.onGetRate();
  }

  updateStateSessionId = (session) => {
    localStorage.setItem("sessionId", session.guest_session_id);
    this.setState({ sessionId: session.guest_session_id });
  };

  updateStateGenres = (genre) => {
    this.setState({ genres: genre.genres });
  };

  onGetRate = () => {
    const { sessionId, network, pageRated } = this.state;
    if (!network && sessionId) {
      this.MoviesService.getRateMovies(sessionId, pageRated)
        .then((response) => {
          //console.log(`Наш ответ от сервера со списком оцененных фильмов: `);
          //console.log(response.success);
          if (response.success === false) {
            //console.log(`Наша сессия невалидна или просрочена! `);
            localStorage.clear();
            this.setState({ sessionId: null });
            this.createGuestSession();
            return;
          }
          //console.log(response);
          const ratingList = response.results.reduce((acc, el) => {
            // console.log(`el.id = ${el.id} el.rating= ${el.rating}`);
            acc.push({ id: el.id, rating: el.rating });
            return acc;
          }, []);
          //console.log(ratingList);
          if (deepEqual(this.state.starsFilms, response) === false) {
            this.setState({ starsFilms: response, ratingList });
          }
        })
        .catch(this.onError);
    }
  };

  onChangeRate = (id, rate) => {
    // console.log(`Вы поставили оценку фильму с id = ${id}`);
    // console.log(`Оценка фильма равна rate = ${rate}`);
    this.MoviesService.setRateMovies(id, this.state.sessionId, rate);
  };

  updateMovies(query, page) {
    this.MoviesService.getMovies(query, page)
      .then((response) => {
        // console.log(`Всего страниц: `);
        // console.log(response.total_pages);
        if (response) {
          // console.log(`Наши фильмы: `);
          // console.log(response);
          if (this.state.films !== response.results) {
            this.setState({
              films: response.results,
              query: query,
              totalPages: response.total_results,
              isLoading: false,
              page: page,
              error: false
            });
          }
        }
      })
      .catch(this.onError);
  }

  receiveQuery = (query) => {
    // console.log(`Вы ввели запрос на поиск фильма: ${query}`);
    // console.log(`А предыдущий запрос был: ${this.state.query}`);
    this.setState({
      isLoading: true
    });
    if (!query) {
      this.setState({
        query: "",
        totalPages: 0
      });
      return;
    }
    if (query !== this.state.query) {
      this.updateMovies(query, 1);
    }
  };

  onChangePage = (page) => {
    const { currentMode } = this.state;
    this.updateMovies(this.state.query, page);
    if (currentMode === "search") {
      this.setState({
        page,
        isLoading: true
      });
    } else {
      this.setState({
        pageRated: page
      });
    }
  };

  onChangePageRated = (page) => {
    this.setState({
      pageRated: page
    });
  };

  onChangeMode = (activeKey) => {
    this.setState({
      currentMode: activeKey
    });
  };

  render() {
    const {
      network,
      error,
      isLoading,
      totalPages,
      page,
      pageRated,
      starsFilms,
      ratingList,
      query
    } = this.state;
    const { messageWillRate } = constants;

    return (
      <div className="wrapper">
        <NetworkState onNetworkState={this.onNetworkState} />
        {network ? (
          <Alert
            className="alert alert-net"
            message={constants.messageFailNet}
          />
        ) : null}
        {error ? (
          <Alert
            className="alert"
            message={constants.messageFailUrl}
            type="error"
            showIcon
          />
        ) : null}
        <Tabs
          size="large"
          centered="true"
          defaultActiveKey="search"
          onChange={this.onChangeMode}
        >
          <TabPane tab="Search" key="search">
            <SearchLine receiveQuery={this.receiveQuery} />
            {query ? (
              isLoading ? (
                <Spin className="spin" size="large" />
              ) : (
                <FilmList
                  films={this.state.films}
                  genres={this.state.genres}
                  onChangeRate={this.onChangeRate}
                  page={"search"}
                  ratingList={ratingList}
                  query={query}
                />
              )
            ) : (
              <Alert message={"Введите поисковый запрос"} />
            )}

            <Pagination
              current={page}
              total={totalPages}
              onChange={this.onChangePage}
              showSizeChanger={false}
              defaultPageSize={20}
            />
          </TabPane>
          <TabPane tab="Rated" key="rated">
            {!starsFilms.results || !starsFilms.results.length ? (
              <Alert message={messageWillRate} />
            ) : (
              <FilmList
                films={starsFilms.results}
                genres={this.state.genres}
                page={"rated"}
                ratingList={ratingList}
                query={query}
              />
            )}
            <Pagination
              current={pageRated}
              total={this.state.starsFilms.total_results}
              onChange={this.onChangePageRated}
              showSizeChanger={false}
              defaultPageSize={20}
            />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

import React, { Component } from "react";
import { Rate, Tag, Alert } from "antd";

import "./film-list.css";
import constants from "../../constants";
import ratingColor from "../../utils/ratingColor";

export default class FilmList extends Component {
  render() {
    const { films, genres, onChangeRate = null, ratingList } = this.props;
    const { posterUrl } = constants;
    // console.log(`Эту информацию мы передали в film-list в качестве props: `);
    // console.log(this.props);

    //Если по запросу ничего не найдено:
    if (!films.length) {
      return <Alert message="По вашему запросу фильмов не найдено" />;
    }

    const list = films.map((el) => {
      //Путь для получения постера к фильму:
      const path = `${posterUrl}${el.poster_path}`;
      //Получаем список жанров:
      const genresList = genres
        .map((genre) => {
          if (el.genre_ids.includes(genre.id)) {
            return <Tag key={genre.id}>{genre.name}</Tag>;
          } else return null;
        })
        .filter((e) => e);

      // Преобразуем дату в текстовый формат:
      let date = new Date(el.release_date).toLocaleString("en-EN", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
      if (date === "Invalid Date") date = null;

      const Rating = () => {
        const color = ratingColor(el.vote_average);
        if (!el.vote_average) {
          return null;
        } else {
          return (
            <div className="filmCard__rating" style={{ borderColor: color }}>
              {el.vote_average.toFixed(1)}
            </div>
          );
        }
      };

      const ratingValue = ratingList.reduce((acc, ratingElement) => {
        if (ratingElement.id === el.id) {
          acc += ratingElement.rating;
        }
        return acc;
      }, 0);

      return (
        <li className="filmCard" key={el.id}>
          <img src={path} alt="" />
          <div className="filmCard__information">
            <div className="filmCard__header">
              <div>{el.title}</div>
              <Rating />
            </div>
            <div className="filmCard__date">{date}</div>
            <div>{genresList}</div>
            <div className="filmCard__description">{el.overview}</div>
            <Rate
              allowHalf
              count={10}
              defaultValue={ratingValue}
              onChange={
                onChangeRate
                  ? (value) => {
                      onChangeRate(el.id, value);
                    }
                  : null
              }
              disabled={onChangeRate ? false : true}
            />
          </div>
        </li>
      );
    });

    return <ul className="filmList">{list}</ul>;
  }
}

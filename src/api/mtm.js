import moment from 'moment';
import axios from 'axios';
import Song from '../entities/Song.js';
import SongRank from '../entities/SongRank.js';
import MediaItem from '../entities/MediaItem.js';
import ChartPosition from '../entities/ChartPosition.js';

const BASE_URL = "http://localhost:8888/api";

export default class MusicAPI {

  constructor() { }

  /**
   * Handles errors in request
   */
  static handleError = (error) => {
    var message = "Unreachable server error";
    if (error.response.data.errors[0] != undefined) {
      message = error.response.data.errors[0].details;
    }

    throw new Error(message);
  };

  /**
   * Get songs in the billboard chart in a given date
   */
  static getChart = (date) => {
    let billboardURL = 'http://localhost:9006/billboard/charts/' + date + '?filter=song';

    return axios.get(billboardURL)
      .then(function (res) {

        let result = res.data;
        let chart = [];

        result.forEach((chartItem) => {
          chart.push(new ChartPosition(chartItem.rank, chartItem.song_id, chartItem.song_name, chartItem.display_artist));
        });

        return chart;
      })
      .catch(function (error) {
        MusicAPI.handleError(error);
      });
  };

  /**
   * Get song information given an id
   */
  static getSongInfo = (id) => {
    let requestUrl = BASE_URL + "/songs/" + id;

    return axios.get(requestUrl)
      .then(function (response) {

        let result = response.data.data;

        let song = new Song(id, result.name, result.artist,
                    result.albumName, result.albumRelease, result.duration,
                    result.url, result.image);

        return song;

      })
      .catch(function (error) {
        MusicAPI.handleError(error);
      });
  }

  /**
   * Get historical ranks of a song given an id
   */
  static getSongRankings = (id) => {
    let requestUrl = BASE_URL + "/songs/" + id + "/ranks";

    return axios.get(requestUrl)
      .then(function (res) {
        let result = res.data.data;
        let rankings = [];

        result.forEach((ranking) => {
          rankings.push(new SongRank(ranking.endDate, ranking.rank));
        });

        return rankings;
      })
      .catch(function (error) {
        MusicAPI.handleError(error);
      });
  }

  /**
   * Get related media of a song given an id.
   */
  static getSongMedia = (id) => {
    let requestUrl = BASE_URL + "/songs/" + id + "/media?n=4";

    return axios.get(requestUrl)
      .then(function (res) {

        let result = res.data.data;
        let media = [];

        result.forEach((mediaObject) => {
          media.push(new MediaItem(mediaObject.url, mediaObject.caption, mediaObject.thumbnail));
        });

        return media;
      })
      .catch(function (error) {
        MusicAPI.handleError(error);
      });
  }
}

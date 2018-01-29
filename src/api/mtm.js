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
    //let requestUrl = BASE_URL + "/songs/" + id;
    let billboardURL = 'http://localhost:9006/billboard/music/song/' + id;

    return axios.get(billboardURL)
      .then(function (response) {

        let result = response.data;

        let spotifyId = result.song.spotify_id;

        let spotifyURL = 'http://localhost:9007/spotify/v1/tracks/' + spotifyId;

        return axios.get(spotifyURL)
          .then(function (response2){

            let result2 = response2.data;
            let artists = '';
            result2.artists.forEach((artist) => {
              artists += artist.name + " ";
            });
            let albumId = result2.album.id;

            return axios.get("http://localhost:9007/spotify/v1/albums/" + albumId)
              .then(function (response3){
                let result3 = response3.data;
                let song = new Song(id, result2.name, artists,
                  result2.album.name, result3.release_date, result2.duration_ms,
                  result2.external_urls.spotify, result2.album.images[0].url);
      
                  return song;
              })
              .catch(function (error3){
                MusicAPI.handleError(error3);
              });
          })
          .catch(function (error2){
            MusicAPI.handleError(error2);
          });

      })
      .catch(function (error) {
        MusicAPI.handleError(error);
      });
  }

  /**
   * Get historical ranks of a song given an id
   */
  static getSongRankings = (id) => {
    //let requestUrl = BASE_URL + "/songs/" + id + "/ranks";
    let billboardURL = "http://localhost:9006/billboard/music/song/" + id;

    return axios.get(billboardURL)
      .then(function (res) {
        let result = res.data;
        let rankings = [];

        result.rankings.forEach((ranking) => {
          rankings.push(new SongRank(ranking.date, ranking.rank));
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
    //let requestUrl = BASE_URL + "/songs/" + id + "/media?n=4";
    let billboardURL = "http://localhost:9006/billboard/music/song/" + id;
    return axios.get(billboardURL)
      .then(function (res) {

        let result = res.data;
        let songName = result.song.song_name;
        let artist = result.song.display_artist;

        let imvdbURL = "http://localhost:9008/imvdb/api/v1/search/videos?q=" + songName + " " + artist;
        let media = [];

        return axios.get(imvdbURL)
          .then(function (res2){
            let result2 = res2.data.results;
            console.log(result2);
            result2.forEach((mediaObject) => {
              media.push(new MediaItem(mediaObject.url, mediaObject.song_title, mediaObject.image.l));
            });
            return media;

          })
          .catch(function (error2){
            MusicAPI.handleError(error2);
          });

      })
      .catch(function (error) {
        MusicAPI.handleError(error);
      });
  }
}

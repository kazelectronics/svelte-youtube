<script>
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import YoutubePlayer from 'youtube-player';

  // Export PlayerState constants for convenience
  export const PlayerState = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5,
  };

  export { className as class }; // HTML class names for container element (optional)
  export let id = undefined; // HTML element ID for player (optional)
  export let videoId;        // Youtube video ID (required)
  export let options = undefined; // YouTube player options (optional)

  let className;             // HTML class names for container element
  let playerElem;            // player DOM element reference
  let player;                // player API instance

  const dispatch = createEventDispatcher();

  // Create player when component mounts
  onMount(() => {
    player = YoutubePlayer(playerElem, options);

    // Register event handlers
    player.on('ready', onPlayerReady);
    player.on('error', onPlayerError);
    player.on('stateChange', onPlayerStateChange);
    player.on('playbackRateChange', onPlayerPlaybackRateChange);
    player.on('playbackQualityChange', onPlayerPlaybackQualityChange);

    // Start playing when mounted
    if (videoId) {
      play(videoId);
    }
  });

  // Clean up player when component is destroyed
  onDestroy(() => {
    if (player) {
      player.destroy();
    }
  });

  // Update videoId and load new video if URL changes
  $: if (player && videoId) {
    play(videoId);
  }

  function play(videoId) {
    // this is needed because the loadVideoById function always starts playing,
    // even if you have set autoplay to 1 whereas the cueVideoById function
    // never starts autoplaying
    if (player && videoId) {
      if (options && options.playerVars && options.playerVars.autoplay === 1) {
        player.loadVideoById(videoId);
      } else {
        player.cueVideoById(videoId);
      }
    }
  }

  /**
   * https://developers.google.com/youtube/iframe_api_reference#onReady
   *
   * @param {Object} event
   *   @param {Object} target - player object
   */
  function onPlayerReady(event) {
    dispatch('ready', event);
  }

  /**
   * https://developers.google.com/youtube/iframe_api_reference#onError
   *
   * @param {Object} event
   *   @param {Integer} data  - error type
   *   @param {Object} target - player object
   */
  function onPlayerError(event) {
    dispatch('error', event);
  }

  /**
   * https://developers.google.com/youtube/iframe_api_reference#onStateChange
   *
   * @param {Object} event
   *   @param {Integer} data  - status change type
   *   @param {Object} target - actual YT player
   */
  function onPlayerStateChange(event) {
    dispatch('stateChange', event)

    switch (event.data) {
      case PlayerState.ENDED:
        dispatch('end', event);
        break;

      case PlayerState.PLAYING:
        dispatch('play', event);
        break;

      case PlayerState.PAUSED:
        dispatch('pause', event);
        break;

      default:
    }
  }

  /**
   * https://developers.google.com/youtube/iframe_api_reference#onPlaybackRateChange
   *
   * @param {Object} event
   *   @param {Float} data    - playback rate
   *   @param {Object} target - actual YT player
   */
  function onPlayerPlaybackRateChange(event) {
    dispatch('playbackRateChange', event);
  }

  /**
   * https://developers.google.com/youtube/iframe_api_reference#onPlaybackQualityChange
   *
   * @param {Object} event
   *   @param {String} data   - playback quality
   *   @param {Object} target - actual YT player
   */
  function onPlayerPlaybackQualityChange(event) {
    dispatch('playbackQualityChange', event);
  }
</script>

<div class={className}>
  <div id={id} bind:this={playerElem}></div>
</div>
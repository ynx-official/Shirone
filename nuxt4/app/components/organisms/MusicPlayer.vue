<script setup lang="ts">
import LocalIcon from "~/components/atoms/LocalIcon.vue";
const props = defineProps<{ config: { tracks: any[]; volume: number } }>();
const { t } = useCopy();
const current = ref(0),
  audio = ref<HTMLAudioElement>(),
  playing = ref(false),
  volume = ref(props.config.volume),
  progress = ref(0),
  playlist = ref(false),
  repeat = ref(false),
  failed = ref(false);
const track = computed(() => props.config.tracks[current.value]);
const duration = computed(
  () => audio.value?.duration || track.value.duration || 1,
);
const time = (v: number) =>
  `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, "0")}`;
async function play() {
  if (!audio.value) return;
  failed.value = false;
  if (playing.value) audio.value.pause();
  else
    try {
      await audio.value.play();
    } catch {
      failed.value = true;
      playing.value = false;
    }
}
async function select(index: number) {
  current.value =
    (index + props.config.tracks.length) % props.config.tracks.length;
  progress.value = 0;
  await nextTick();
  failed.value = false;
  try {
    await audio.value?.play();
  } catch {
    failed.value = true;
    playing.value = false;
  }
}
function ended() {
  if (repeat.value) {
    if (audio.value) audio.value.currentTime = 0;
    void audio.value?.play();
  } else void select(current.value + 1);
}
function seek(event: Event) {
  if (audio.value)
    audio.value.currentTime = Number((event.target as HTMLInputElement).value);
}
onMounted(() => {
  if (audio.value) audio.value.volume = volume.value;
});
watch(volume, (v) => {
  if (audio.value) audio.value.volume = v;
});
onBeforeUnmount(() => audio.value?.pause());
</script>
<template>
  <section v-if="track" class="panel music-panel">
    <h2>{{ t("music") }}</h2>
    <div class="music-track">
      <img
        :src="track.cover?.replace(/^assets\//, '/assets/')"
        alt=""
        width="56"
        height="56"
      />
      <div class="music-info">
        <div class="music-title">{{ track.title }}</div>
        <div>{{ track.artist }}</div>
        <div class="music-time">
          {{ time(progress) }} / {{ time(duration)
          }}<label class="music-volume"
            ><LocalIcon name="material-symbols:volume-up-rounded" /><input
              v-model.number="volume"
              :aria-label="
                t('musicVolume').replace(
                  '{volume}',
                  String(Math.round(volume * 100)),
                )
              "
              type="range"
              min="0"
              max="1"
              step=".05"
          /></label>
        </div>
      </div>
    </div>
    <audio
      ref="audio"
      :src="track.source"
      preload="none"
      @play="playing = true"
      @pause="playing = false"
      @ended="ended"
      @timeupdate="progress = audio?.currentTime || 0"
    /><input
      class="music-progress"
      type="range"
      min="0"
      :max="duration"
      :value="progress"
      :aria-label="
        t('musicProgress')
          .replace('{current}', time(progress))
          .replace('{duration}', time(duration))
      "
      @input="seek"
    />
    <div class="music-controls">
      <button
        :aria-label="t('musicModeRepeatOne')"
        :aria-pressed="repeat"
        @click="repeat = !repeat"
      >
        <LocalIcon name="material-symbols:repeat-rounded" /></button
      ><button :aria-label="t('musicPrevious')" @click="select(current - 1)">
        <LocalIcon name="material-symbols:skip-previous-rounded" /></button
      ><button
        class="music-play"
        :aria-label="t(playing ? 'musicPause' : 'musicPlay')"
        @click="play"
      >
        <LocalIcon
          :name="
            playing
              ? 'material-symbols:pause-rounded'
              : 'material-symbols:play-arrow-rounded'
          "
        /></button
      ><button :aria-label="t('musicNext')" @click="select(current + 1)">
        <LocalIcon name="material-symbols:skip-next-rounded" /></button
      ><button
        :aria-label="t(playlist ? 'musicHidePlaylist' : 'musicShowPlaylist')"
        :aria-expanded="playlist"
        @click="playlist = !playlist"
      >
        <LocalIcon name="material-symbols:queue-music-rounded" />
      </button>
    </div>
    <p v-if="failed" role="alert">{{ t("musicErrorSourceUnavailable") }}</p>
    <ol v-if="playlist" class="music-playlist">
      <li v-for="(item, i) in config.tracks" :key="item.id">
        <button
          :aria-current="i === current ? 'true' : undefined"
          @click="select(i)"
        >
          {{ item.title }} · {{ item.artist }}
        </button>
      </li>
    </ol>
  </section>
</template>

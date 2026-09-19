<script setup lang="ts">
const props = defineProps<{ dates: string[]; today: string }>();
const { locale, t } = useCopy();
const initial = props.today.slice(0, 7),
  month = ref(new Date(initial + "-01T00:00:00Z"));
const label = computed(() =>
  new Intl.DateTimeFormat(locale.value.replace("_", "-"), {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(month.value),
);
const days = computed(() =>
  Array.from(
    {
      length: new Date(
        Date.UTC(
          month.value.getUTCFullYear(),
          month.value.getUTCMonth() + 1,
          0,
        ),
      ).getUTCDate(),
    },
    (_, i) =>
      `${month.value.getUTCFullYear()}-${String(month.value.getUTCMonth() + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
  ),
);
const offset = computed(() => (month.value.getUTCDay() + 6) % 7);
const weekdays = computed(() =>
  Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale.value.replace("_", "-"), {
      weekday: "short",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(2026, 8, 14 + i))),
  ),
);
const active = computed(() => new Set(props.dates.map((d) => d.slice(0, 10))));
function move(delta: number) {
  month.value = new Date(
    Date.UTC(
      month.value.getUTCFullYear(),
      month.value.getUTCMonth() + delta,
      1,
    ),
  );
}
</script>
<template>
  <section class="panel">
    <h2>{{ t("calendar") }}</h2>
    <div class="calendar-controls">
      <button :aria-label="t('previous')" @click="move(-1)">‹</button
      ><span>{{ label }}</span
      ><button :aria-label="t('next')" @click="move(1)">›</button>
    </div>
    <div class="calendar-grid">
      <span v-for="day in weekdays" :key="day" class="weekday">{{ day }}</span
      ><span v-for="i in offset" :key="`empty-${i}`" /><template
        v-for="date in days"
        :key="date"
        ><NuxtLink
          v-if="active.has(date)"
          class="chip"
          :to="{ path: '/archive/', query: { date } }"
          >{{ Number(date.slice(-2)) }}</NuxtLink
        ><span
          v-else
          :class="{ today: date === today, 'day-empty': !active.has(date) }"
          >{{ Number(date.slice(-2)) }}</span
        ></template
      >
    </div>
  </section>
</template>

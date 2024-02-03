<template>
  <q-page class="" style="overflow: hidden" @click="fireScreenUnlockMethod">
    <div v-if="!lockedScreenBool">
      <!-- <div
        class="row"
        style="
          width: 100%;
          height: 5vh;
          background-color: #1d1d1d;
          -webkit-user-select: none;
          -webkit-app-region: drag;
        "
      /> -->
      <div class="row justify-center q-mt-sm">
        <q-btn
          flat
          class="q-ma-sm"
          icon="colorize"
          style="
            border: 2px solid #000000;
            border-radius: 8px;
            width: 1rem;
            height: 1rem;
          "
        >
          <q-tooltip style="font-size: 1rem"
            >Choose background colour</q-tooltip
          >
        </q-btn>

        <q-btn
          flat
          class="q-ma-sm"
          icon="image"
          style="
            border: 2px solid #000000;
            border-radius: 8px;
            width: 1rem;
            height: 1rem;
          "
          ><q-tooltip style="font-size: 1rem"
            >Select an image to display</q-tooltip
          ></q-btn
        >
        <q-btn
          flat
          icon="key"
          class="q-ma-sm"
          style="
            border: 2px solid #000000;
            border-radius: 8px;
            width: 1rem;
            height: 1rem;
          "
          ><q-tooltip style="font-size: 1rem"
            >Setup new key for unlocking</q-tooltip
          ></q-btn
        >
        <q-btn
          flat
          :icon="`${lockedScreenBool ? 'lock' : 'lock_open'}`"
          class="q-ma-sm"
          @click="setupLockUnlockMethod"
          style="
            border: 2px solid #000000;
            border-radius: 8px;
            width: 4rem;
            height: 4rem;
          "
          ><q-tooltip style="font-size: 1rem">{{
            lockedScreenBool ? "Click to unlock" : "Click to lock"
          }}</q-tooltip></q-btn
        >
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "IndexPage",
  data() {
    return {
      lockedScreenBool: false,
    };
  },
  methods: {
    setupLockUnlockMethod(e) {
      if (this.lockedScreenBool) {
        window.ScreenHiderAPI.setupLockStatus(false);
        this.lockedScreenBool = false;
      } else {
        window.ScreenHiderAPI.setupLockStatus(true);
        this.lockedScreenBool = true;
        e.stopPropagation();
      }
    },
    fireScreenUnlockMethod() {
      console.log("called");
      if (this.lockedScreenBool) {
        window.ScreenHiderAPI.setupLockStatus(false);
        this.lockedScreenBool = false;
      }
    },
  },
});
</script>

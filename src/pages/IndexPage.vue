<template>
  <q-page
    class=""
    :style="`overflow: hidden; background-color: ${backgroundColour}; ${
      !backgroundTypeColour ? 'background-image: url(' + imgSrc + ')' : ''
    }`"
    @click="fireScreenUnlockMethod"
  >
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
            background-color: #ffffff;
          "
        >
          <q-tooltip style="font-size: 1rem"
            >Choose background colour</q-tooltip
          >
          <q-popup-proxy>
            <q-banner
              class="bg-black q-ma-none q-pa-none"
              style="border: 2px solid #2f2f2f"
            >
              <q-color
                v-model="backgroundColour"
                class="my-picker"
                @change="saveChangedBackgroundColourMethod"
              />
            </q-banner>
          </q-popup-proxy>
        </q-btn>

        <q-btn
          flat
          class="q-ma-sm"
          icon="image"
          @click="pickupAnImageMethod"
          style="
            border: 2px solid #000000;
            border-radius: 8px;
            width: 1rem;
            height: 1rem;
            background-color: #ffffff;
          "
          ><q-tooltip style="font-size: 1rem"
            >Select an image to display</q-tooltip
          ></q-btn
        >
        <q-btn
          flat
          icon="key"
          class="q-ma-sm"
          @click="pinAskingDialog = true"
          style="
            border: 2px solid #000000;
            border-radius: 8px;
            width: 1rem;
            height: 1rem;
            background-color: #ffffff;
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
            background-color: #ffffff;
          "
          ><q-tooltip style="font-size: 1rem">{{
            lockedScreenBool ? "Click to unlock" : "Click to lock"
          }}</q-tooltip></q-btn
        >
      </div>
    </div>

    <q-dialog v-model="pinAskingDialog">
      <q-card class="q-ma-md" style="background-color: #fdfdfd">
        <q-card-section>
          <div class="row">
            <span class="text-h6 self-center q-mr-sm">{{
              lockedScreenBool ? "Enter key to unlock" : "Save a new key"
            }}</span>
            <q-space />
            <q-btn
              icon="close"
              style="
                width: 3em !important;
                height: 3em !important;
                border-radius: 8px;
              "
              flat
              @click="pinAskingDialog = false"
            />
          </div>
        </q-card-section>
        <q-card-section class="q-mt-none q-pt-none">
          <div class="row justify-center">
            <q-input
              v-model="keyInput"
              color="grey-10"
              rounded
              outlined
              :type="lockedScreenBool ? 'password' : 'text'"
            />
          </div>
          <div class="row justify-center q-mt-sm">
            <q-btn
              v-if="!lockedScreenBool"
              rounded
              label="Save"
              flat
              style="border: 2px solid #000000"
              @click="savePinMethod"
            />
            <q-btn
              v-if="lockedScreenBool"
              rounded
              label="Unlock"
              flat
              style="border: 2px solid #78eb80"
              @click="unlockWithPinMethod"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { LocalStorage, Notify } from "quasar";
export default defineComponent({
  name: "IndexPage",
  data() {
    return {
      lockedScreenBool: false,
      pinAskingDialog: false,
      keyInput: "",
      backgroundColour: "#ffffff",
      imgSrc: null,
      backgroundTypeColour: true,
    };
  },
  mounted() {
    if (LocalStorage.getItem("savedBackgroundColour")) {
      this.backgroundColour = LocalStorage.getItem("savedBackgroundColour");
    }
    if (LocalStorage.getItem("SavedCurrentImageData")) {
      this.imgSrc = LocalStorage.getItem("SavedCurrentImageData");
    }
    this.backgroundTypeColour = LocalStorage.getItem("backgroundTypeColour");
    if (
      this.backgroundTypeColour == null ||
      this.backgroundTypeColour == undefined
    ) {
      this.backgroundTypeColour = true;
    }
  },
  methods: {
    async pickupAnImageMethod() {
      var imgData = await window.ScreenHideAPI.selectAndShowIMG();
      if (!imgData) {
        return;
      }
      this.imgSrc = imgData;
      LocalStorage.set("SavedCurrentImageData", this.imgSrc);
      this.backgroundTypeColour = false;
      LocalStorage.set("backgroundTypeColour", this.backgroundTypeColour);
    },
    setupLockUnlockMethod(e) {
      if (!LocalStorage.getItem("saved_pin")) {
        Notify.create({ message: "🔑 Set up some key first" });
        this.pinAskingDialog = true;
        return;
      }
      if (this.lockedScreenBool) {
        window.ScreenHideAPI.setupLockStatus(false);
        this.lockedScreenBool = false;
      } else {
        window.ScreenHideAPI.setupLockStatus(true);
        this.lockedScreenBool = true;
        e.stopPropagation();
      }
    },
    fireScreenUnlockMethod() {
      if (this.lockedScreenBool) {
        this.pinAskingDialog = true;
      }
    },
    saveChangedBackgroundColourMethod(value) {
      LocalStorage.set("savedBackgroundColour", value);
      this.backgroundTypeColour = true;
      LocalStorage.set("backgroundTypeColour", this.backgroundTypeColour);
    },
    savePinMethod() {
      LocalStorage.set("saved_pin", this.getDigestedValue(this.keyInput));
      this.pinAskingDialog = false;
      this.keyInput = "";
    },
    unlockWithPinMethod() {
      if (
        this.getDigestedValue(this.keyInput) ==
        LocalStorage.getItem("saved_pin")
      ) {
        window.ScreenHideAPI.setupLockStatus(false);
        this.lockedScreenBool = false;
        this.pinAskingDialog = false;
        Notify.create({ message: "🔓 Unlocked" });
      } else {
        Notify.create({ message: "🔒 Incorrect Pin" });
      }
      this.keyInput = "";
    },

    getDigestedValue(val) {
      var hash = 0,
        i,
        chr;
      if (val.length === 0) return hash;
      for (i = 0; i < val.length; i++) {
        chr = val.charCodeAt(i);
        hash = (hash << 8) - hash + chr;
        hash |= 0; // Convert to 32bit integer
        hash = 2147483647 % hash;
      }
      return hash;
    },
  },
});
</script>

<template>
  <q-page
    class="screen-page"
    :style="{
      backgroundColor: backgroundColour,
      backgroundImage: !backgroundTypeColour ? 'url(' + imgSrc + ')' : '',
    }"
    @click="fireScreenUnlockMethod"
  >
    <div v-if="!lockedScreenBool">
      <div class="screen-drag-area" />
      <div class="screen-toolbar">
        <q-btn
          flat
          class="screen-tool"
          icon="colorize"
          :aria-label="$t('toolbar.backgroundColour')"
        >
          <q-tooltip class="screen-tooltip">{{ $t("toolbar.backgroundColour") }}</q-tooltip>
          <q-popup-proxy>
            <q-banner class="bg-black q-ma-none q-pa-none" style="border: 2px solid #2f2f2f">
              <q-color v-model="backgroundColour" @change="saveChangedBackgroundColourMethod" />
            </q-banner>
          </q-popup-proxy>
        </q-btn>

        <q-btn
          flat
          class="screen-tool"
          icon="image"
          :aria-label="$t('toolbar.selectImage')"
          @click="pickupAnImageMethod"
        >
          <q-tooltip class="screen-tooltip">{{ $t("toolbar.selectImage") }}</q-tooltip>
        </q-btn>

        <q-btn
          flat
          class="screen-tool"
          icon="key"
          :aria-label="$t('toolbar.setupKey')"
          @click="pinAskingDialog = true"
        >
          <q-tooltip class="screen-tooltip">{{ $t("toolbar.setupKey") }}</q-tooltip>
        </q-btn>

        <q-btn
          flat
          class="screen-tool"
          icon="settings"
          :aria-label="$t('settings.title')"
          @click="settingsDialog = true"
        >
          <q-tooltip class="screen-tooltip">{{ $t("settings.title") }}</q-tooltip>
        </q-btn>

        <q-btn
          flat
          class="screen-tool screen-lock"
          :icon="lockedScreenBool ? 'lock' : 'lock_open'"
          :aria-label="$t(lockedScreenBool ? 'toolbar.unlock' : 'toolbar.lock')"
          @click="setupLockUnlockMethod"
        >
          <q-tooltip class="screen-tooltip">{{
            $t(lockedScreenBool ? "toolbar.unlock" : "toolbar.lock")
          }}</q-tooltip>
        </q-btn>
      </div>
    </div>

    <SettingsDialog v-if="!lockedScreenBool" v-model="settingsDialog" />

    <q-dialog v-model="pinAskingDialog" aria-labelledby="pin-dialog-title">
      <q-card class="screen-dialog">
        <q-card-section class="screen-dialog-header">
          <h2 id="pin-dialog-title" class="screen-dialog-title">
            {{ $t(lockedScreenBool ? "pin.enterKey" : "pin.saveKey") }}
          </h2>
          <q-btn
            flat
            round
            icon="close"
            :aria-label="$t('common.close')"
            @click="pinAskingDialog = false"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="keyInput"
            outlined
            rounded
            color="grey-10"
            :aria-label="$t('pin.field')"
            :type="lockedScreenBool ? 'password' : 'text'"
          />
          <div class="row justify-center q-mt-sm">
            <q-btn
              v-if="!lockedScreenBool"
              flat
              rounded
              :label="$t('pin.save')"
              style="border: 2px solid #000"
              @click="savePinMethod"
            />
            <q-btn
              v-else
              flat
              rounded
              :label="$t('pin.unlock')"
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
import SettingsDialog from "components/SettingsDialog.vue";
export default defineComponent({
  name: "IndexPage",
  components: { SettingsDialog },
  data() {
    return {
      lockedScreenBool: false,
      pinAskingDialog: false,
      settingsDialog: false,
      dismissNotification: null,
      keyInput: "",
      backgroundColour: "#ffffff",
      imgSrc: null,
      backgroundTypeColour: true,
    };
  },
  watch: {
    "$i18n.locale"() {
      this.dismissNotification?.();
      this.dismissNotification = null;
    },
  },
  mounted() {
    if (LocalStorage.getItem("savedBackgroundColour")) {
      this.backgroundColour = LocalStorage.getItem("savedBackgroundColour");
    }
    if (LocalStorage.getItem("SavedCurrentImageData")) {
      this.imgSrc = LocalStorage.getItem("SavedCurrentImageData");
    }
    this.backgroundTypeColour = LocalStorage.getItem("backgroundTypeColour");
    if (this.backgroundTypeColour == null || this.backgroundTypeColour == undefined) {
      this.backgroundTypeColour = true;
    }
  },
  methods: {
    showNotification(key) {
      this.dismissNotification?.();
      this.dismissNotification = Notify.create({ message: this.$t(key) });
    },
    async pickupAnImageMethod() {
      try {
        const image = await window.ScreenHideAPI.selectAndShowIMG(this.$i18n.locale);
        if (!image) return;
        LocalStorage.set("SavedCurrentImageData", image);
        LocalStorage.set("backgroundTypeColour", false);
        this.imgSrc = image;
        this.backgroundTypeColour = false;
      } catch {
        this.showNotification("imageDialog.failed");
      }
    },
    setupLockUnlockMethod(e) {
      if (!LocalStorage.getItem("saved_pin")) {
        this.showNotification("pin.setupFirst");
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
      if (this.getDigestedValue(this.keyInput) == LocalStorage.getItem("saved_pin")) {
        window.ScreenHideAPI.setupLockStatus(false);
        this.lockedScreenBool = false;
        this.pinAskingDialog = false;
        this.showNotification("pin.unlocked");
      } else {
        this.showNotification("pin.incorrect");
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

<style scoped>
.screen-page {
  overflow: hidden;
}

.screen-drag-area {
  min-height: max(2rem, 5vh);
  background-color: #1d1d1d;
  user-select: none;
  -webkit-app-region: drag;
}

.screen-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
}

.screen-tool {
  border: 2px solid #000;
  border-radius: 8px;
  background-color: #fff;
}

.screen-lock {
  width: 4rem;
  height: 4rem;
}
</style>

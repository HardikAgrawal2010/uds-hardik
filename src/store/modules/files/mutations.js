/* ============
 * Mutations for the files module
 * ============
 *
 * The mutations that are available on the
 * account module.
 */

import Vue from 'vue';
import {
  stat
} from 'fs';
import {
  FILES,
  CONNECTIONS,
  SHOW_SNACKBAR,
  CLOSE_SNACKBAR,
  PROGRESS,
  SET_ROOT,
  SET_STORAGE,
  CHUNK_COUNT
} from './mutation-types';

/* eslint-disable no-param-reassign */
export default {
  [FILES](state, files) {
    state.files = files
  },
  /**
   * Progress mutations update the state.uploads and state.downloads
   * entries.
   *
   * 
   * @param {Vuex.State} state 
   * @param {Object} a destructured object
   * @param {String} o.type the type of the transfer ['upload', 'download']
   * @param {String} o.transferId unique ID of the transfer
   * @param {String} o.name filename
   * @param {String} o.id Drive ID of file
   * @param {String} o.parts_total total number of parts needed
   * 
   */
  [PROGRESS](state, {
    type,
    transferId,
    name,
    id,
    parts_total,
    message,
    isFailure = false,
    dontIncrement = false
  }) {
    if (!type || !['upload', 'download'].includes(type) || !transferId) return
    const i = `${type}s`

    const _state = state[i]
    const transfer = _state[transferId]

    // Handle new transfer
    if (!transfer) {
      Vue.set(state[i], transferId, {
        name,
        id,
        parts_completed: 0,
        parts_total,
        message: `Starting ${type}...`,
        indeterminate: true
      })
      return
    }

    if (transfer.finished) return

    if (!transfer.id && id) transfer.id = id

    if (!transfer.parts_total && parts_total) transfer.parts_total = parts_total

    if (!transfer.name && name) transfer.name = name

    console.log(`${id} : ${transfer.id}`)

    // Transfer isn't new, so update with progress data
    if (!isFailure && !dontIncrement) {
      transfer.parts_completed += 1
      transfer.indeterminate = false
    } else if (isFailure) {
      transfer.finished = true
      transfer.isFailure = true
      return
    }

    const prefix = type.charAt(0).toUpperCase() + type.slice(1) + "ed"

    if (transfer.parts_completed >= transfer.parts_total) {
      // Handle finished 
      transfer.finished = true
      transfer.message = `${prefix} complete.`
      Vue.store.dispatch('files/setFinished', transfer.id)
    } else {
      // Just update with progress
      transfer.message = message || `${prefix} ${transfer.parts_completed} of ${transfer.parts_total} parts...`
    }


  },
  [CONNECTIONS](state, inc) {
    state.connections += inc
  },
  [SHOW_SNACKBAR](state, payload) {
    state.snackbar.text = payload.text
    state.snackbar.multiline = (payload.text.length > 50)

    if (payload.multiline) {
      state.snackbar.multiline = payload.multiline
    }

    if (payload.timeout) {
      state.snackbar.timeout = payload.timeout
    }

    state.snackbar.visible = true
  },
  [CLOSE_SNACKBAR](state) {
    state.snackbar.visible = false
    state.snackbar.multiline = false
    state.snackbar.timeout = 6000
    state.snackbar.text = null
  },
  [SET_ROOT](state, id) {
    state.root = id
  },
  [SET_STORAGE](state, bytes) {
    state.storage = bytes
  },
  [CHUNK_COUNT](state, increment) {
    if (increment) {
      state.chunk_count += 1
    } else if (!increment && state.chunk_count > 0) {
      state.chunk_count -= 1
    }
  }
};

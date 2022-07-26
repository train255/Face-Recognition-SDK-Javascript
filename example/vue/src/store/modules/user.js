
export default {
    namespaced: true,
    state: {
        user_email: null
    },
    mutations: {
        set(state, user_email) {
            state.user_email = user_email
        }
    },
    actions: {
    },
    getters: {
        fetch_user_info(state) {
            return state.user_email
        }
    }
}


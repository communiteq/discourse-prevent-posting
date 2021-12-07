import { withPluginApi } from "discourse/lib/plugin-api";
import I18n from "I18n";

function initialize(api, container) {
  const siteSettings = container.lookup("site-settings:main");

  api.onPageChange(() =>{

    function setState(selector, disableState) {
      var els = document.querySelectorAll(selector);
      for (var i=0; i<els.length; i++) {
        if (disableState) {
          els[i].setAttribute('disabled', 'disabled');
        } else {
          els[i].removeAttribute('disabled');
        }
      }
    }

    if (siteSettings.prevent_posting_enabled) {
      document.querySelector("body").classList.add("prevent-posting");
    } else {
      document.querySelector("body").classList.remove("prevent-posting");
    }

    var disableState = siteSettings.prevent_posting_enabled;
    setState("body.prevent-posting:not(.archetype-private_message) button#create-topic", disableState);
    setState("body.prevent-posting:not(.archetype-private_message) .topic-footer-main-buttons .create", disableState);
    setState("body.prevent-posting:not(.archetype-private_message) .post-controls .actions .create", disableState);
    setState("body.prevent-posting:not(.archetype-private_message) .quote-button button", disableState);

    if (!siteSettings.prevent_posting_enabled || siteSettings.prevent_posting_allow_pms) {
      document.querySelector("body").classList.remove("prevent-posting-pms");
    } else {
      document.querySelector("body").classList.add("prevent-posting-pms");
    }

    var disableState = siteSettings.prevent_posting_enabled && !siteSettings.prevent_posting_allow_pms;
    setState("body.prevent-posting-pms button.new-private-message", disableState);
    setState("body.prevent-posting-pms.archetype-private_message .topic-footer-main-buttons .create", disableState);
    setState("body.prevent-posting-pms.archetype-private_message .post-controls .actions .create", disableState);
    setState("body.prevent-posting-pms.archetype-private_message .quote-button button", disableState);
  });
}

export default {
  name: "prevent-posting",

  initialize(container) {
    withPluginApi("0.8", (api) => initialize(api, container));
  },
};


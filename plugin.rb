# frozen_string_literal: true

# name: discourse-prevent-posting
# about: prevent new posts being made
# version: 1.0
# authors: richard@discoursehosting.com
# url: https://github.com/communiteq/discourse-prevent-posting

register_asset "stylesheets/prevent-posting.scss"

enabled_site_setting :prevent_posting_enabled

PLUGIN_NAME ||= "discourse_prevent_posting".freeze

after_initialize do
  NewPostManager.add_handler do |manager|
    next unless SiteSetting.prevent_posting_enabled

    if SiteSetting.prevent_posting_allow_pms
      next if manager.args[:archetype] == 'private_message' 
      if manager.args[:topic_id]
        topic = Topic.find(manager.args[:topic_id])
        next if topic && topic.archetype == 'private_message'
      end
    end

    result = NewPostResult.new(:created_post, false)
    result.errors.add(:base, SiteSetting.prevent_posting_message)
    next result
  end

  DiscourseEvent.on(:site_setting_changed) do |setting|
    if setting['name'] == 'prevent_posting_enabled'
      if setting['value'] == 't'
        SiteSetting.global_notice = SiteSetting.prevent_posting_message
      else
        SiteSetting.global_notice = ''
      end
      MessageBus.publish('/refresh_client', 'clobber')
    end
    if setting['name'] == 'prevent_posting_message'
      if SiteSetting.prevent_posting_enabled
        SiteSetting.global_notice = setting['value']
        MessageBus.publish('/refresh_client', 'clobber')
      end
    end
    if setting['name'] == 'prevent_posting_allow_pms'
      MessageBus.publish('/refresh_client', 'clobber')
    end
  end
end

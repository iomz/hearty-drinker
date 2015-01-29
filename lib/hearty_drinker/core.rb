module HeartyDrinker
  module Core
    # time at midnight
    MIDNIGHT = '00:00'.freeze

    def config
      @config ||= {}
    end

    def load_config
      YAML.load_file(File.expand_path('../../../config.yml', __FILE__)).each{ |k,v| config[k.to_sym] = v }
    end

  end

  extend Core
  HeartyDrinker.load_config
end


%w(
  faye/websocket
  haml
  json
  open-uri
  puma
  sinatra/activerecord
  sinatra/base
  time
  yaml
).each { |lib| require lib }

%w(
  user
  check_log
  core
  websocket_handler
).each { |name| require_dependency File.expand_path("../hearty_drinker/#{name}", __FILE__) }

module HeartyDrinker
  class App < Sinatra::Base
    register Sinatra::ActiveRecordExtension
    set :database, HeartyDrinker.config[:database]
    set :root, File.expand_path("../../", __FILE__)

    get '/' do
      haml :index
    end
  end
end


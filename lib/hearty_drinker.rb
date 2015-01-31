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

    get '/logs' do
      @users = User.all
      @logs = CheckLog.all

      log_arr = []
      log = nil
      @logs.each do |l|
          if log.nil?
            log = {}
            log[:uid] = l[:uid]
            log[:concentrations] = []
          elsif log[:uid] != l[:uid]
            log_arr.push(log)
            log = {}
            log[:uid] = l[:uid]
            log[:concentrations] = []
          end
          log[:concentrations].push(l[:concentration])
      end
      log_arr.push(log)
      @logs_json = log_arr.to_json

      haml :logs
    end
    
  end
end


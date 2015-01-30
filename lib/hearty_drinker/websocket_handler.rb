module HeartyDrinker
  class WebsocketHandler
    KEEPALIVE_TIME = 15
    def initialize(app)
      @app = app
      @clients = []
    end

    def call(env)
      if Faye::WebSocket.websocket?(env)
        ws = Faye::WebSocket.new(env, nil, ping: KEEPALIVE_TIME)

        ws.on(:open) do |event|
          p [:open, ws.object_id]
          @clients << ws
          #ws.send({ you: ws.object_id }.to_json)
          #@clients.each do |client|
          #  client.send({ count: @clients.size }.to_json)
          #end
        end

        ws.on(:message) do |event|
          p [:message, event.data]
          data = JSON.parse(event.data)
          name = data['name']
          if HeartyDrinker::User.where(name: name).empty? 
            name = ws.object_id.to_s if name == "" 
            trial = HeartyDrinker::User.create(name: name, weight: data['weight']).tried
          else
            u = HeartyDrinker::User.find_by_name(name)
            u.weight = data['weight']
            u.tried += 1
            u.save!
            trial = u.tried
          end
          uid = HeartyDrinker::User.find_by_name(name).id
          beer_count = data['beer_count']
          data['logs'].each do |k, v|
            HeartyDrinker::CheckLog.create(uid: uid, beer_count: beer_count, trial: trial, minutes_elapsed: k, concentration: v)
          end
          ws.send({ name: ws.object_id }.to_json)
        end

        ws.on(:close) do |event|
          p [:close, ws.object_id, event.code]
          @clients.delete(ws)
          #@clients.each do |client|
          #  client.send({ count: @clients.size }.to_json)
          #end
          ws = nil
        end
        ws.rack_response
      else
        @app.call(env)
      end
    end
  end
end

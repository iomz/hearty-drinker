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
          begin
            name = data['name']
            annon = false
            if User.where(name: name).empty? 
              if name == "" 
                name = ws.object_id.to_s 
                annon = true
              end
              trial = User.create(name: name, sex: data['sex'], weight: data['weight']).tried
            else
              u = User.find_by_name(name)
              u.sex = data['sex']
              u.weight = data['weight']
              u.tried += 1
              u.save!
              trial = u.tried
            end
            uid = User.find_by_name(name).id
            alcohol = data['alcohol']
            data['logs'].each do |k, v|
              CheckLog.create(uid: uid, alcohol: alcohol, trial: trial, minutes_elapsed: k, concentration: v)
            end
            if annon
              ws.send({ result: "success", name: ws.object_id }.to_json)
            else
              ws.send({ result: "success", name: u.name }.to_json)
            end
          rescue
            p "## Something went wrong! ##"
          end
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

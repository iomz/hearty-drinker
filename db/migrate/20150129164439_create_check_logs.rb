class CreateCheckLogs < ActiveRecord::Migration
  def change
    create_table :check_logs do |t|
      t.integer :uid
      t.integer :beer_count
      t.integer :trial
      t.integer :minutes_elapsed
      t.float :concentration
      t.timestamps :null => true
    end
  end
end

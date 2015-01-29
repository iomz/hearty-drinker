class CreateCheckLogs < ActiveRecord::Migration
  def change
    create_table :check_logs do |t|
      t.integer :user_id
      t.integer :trial
      t.integer :minutes_elapsed
      t.float :concentration
      t.timestamps :null => true
    end
  end
end

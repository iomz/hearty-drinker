class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :name
      t.float :weight
      t.integer :tried, :default => 1
      t.timestamps :null => true
    end
  end
end

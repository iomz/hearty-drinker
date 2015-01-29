class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :name
      t.string :e_mail
      t.float :weight
      t.timestamps :null => true
    end
  end
end

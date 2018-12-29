class AddUsernameToUsers < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :username, :string
    add_index :users, :username, unique: true
    add_column :users, :add_img_to_users, :string
    add_column :users, :img, :string
  end
end

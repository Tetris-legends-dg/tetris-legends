class AddThumbnailToBlog < ActiveRecord::Migration[5.2]
  def change
    add_column :blogs, :thumbnail, :string
  end
end

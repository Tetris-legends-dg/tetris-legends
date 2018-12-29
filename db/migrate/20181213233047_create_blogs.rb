class CreateBlogs < ActiveRecord::Migration[5.2]
  def change
    create_table :blogs do |t|
      t.string :title
      t.string :text
      t.string :date

      t.timestamps
    end
  end
end

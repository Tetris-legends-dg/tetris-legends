class HomeController < ApplicationController
  def index
    @first = Blog.find(1)
    @rest = Blog.find(2,3,4)
  end
end

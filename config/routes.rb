Rails.application.routes.draw do
  devise_for :users
  get 'home/index'
  resources :blogs
  root 'home#index'
end

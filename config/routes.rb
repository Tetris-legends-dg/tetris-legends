Rails.application.routes.draw do
  get 'home/index'
  resources :blogs
  root 'home#index'
end

<?php
namespace Application;

class Page
{
    public function badRequest() 
    {
        http_response_code(400);
        echo "Bad Request";
    }

    public function item($data)
    {
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode($data);
    }
}
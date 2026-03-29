<?php
namespace Application;
use PDO;

class Database
{
    protected $db;

    public function __construct($schema) {
        $this->db = new PDO('pgsql:host=server-postgres;port=5432;user=postgres;password=12345');
        $this->db->exec("SET search_path TO $schema");
    }

    public function getDb() 
    {
        return $this->db;
    }

    public function reseed() {
        $commands = file_get_contents(__DIR__ . '/../../sql/02-seed.sql');
        $this->db->exec($commands);
    }
}
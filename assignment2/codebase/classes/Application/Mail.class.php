<?php
namespace Application;

// required for using the PDO::FETCH_ASSOC constant
use PDO;

class Mail
{
    protected $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function createMail($name, $message)
    {
        $stmt = $this->db->prepare("INSERT INTO mail (name, message) VALUES (:name, :message)");
        $stmt->execute(['name' => $name, 'message' => $message]);

        return $this->db->lastInsertId();
    }

    public function listMail() 
    {
        $result = $this->db->query("SELECT id, name FROM mail ORDER BY id");

        return $result->fetchAll(PDO::FETCH_ASSOC);
    }
}
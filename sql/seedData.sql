DO $$
DECLARE
	users_counter integer := 1;
	max_users integer := 20;
BEGIN
	WHILE users_counter <=max_users loop
		INSERT INTO users (email, password_hash, profile_photo_url) VALUES ('test' || users_counter || '@test.com', '$2a$04$14f5XjhjOn4OeFlClKgvxe0RMSasRgrYePJtHf4WnKvMi53UZUvaW', 'https://www.placecage.com/200/300');
			users_counter = users_counter + 1;
	end loop;
END $$;

DO $$
DECLARE 
	max_users integer := 20;
	max_grams integer := 20;
	users_counter integer := 1;
BEGIN
WHILE users_counter <=max_users loop

	DECLARE grams_counter integer :=users_counter;
	BEGIN
	WHILE grams_counter <=max_grams loop
		INSERT INTO grams (photo_url, caption, tags, user_id) VALUES ('https://www.placecage.com/200/300', 'image' || max_users + 1 - grams_counter, '{awesome, cool}', users_counter);
		grams_counter = grams_counter + 1;
	end loop;
	END;
	users_counter = users_counter + 1;
END LOOP;
END $$;

DO $$
DECLARE 
	max_users integer := 20;
	max_grams integer := 20;
	users_counter integer := 1;
BEGIN
WHILE users_counter <=max_users loop
	DECLARE grams_counter integer :=users_counter;
	BEGIN
	WHILE @grams_counter <=max_grams loop
		INSERT INTO comments (comment, user_id, gram_id) VALUES ('hello', users_counter, max_grams + 1 - grams_counter);
		grams_counter = grams_counter + 1;
	end loop;
	END;
	users_counter = users_counter + 1;
END LOOP;
END $$;
